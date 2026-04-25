<?php
// api/bookings.php
require_once __DIR__ . '/base.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = getInput();

if ($method === 'GET') {
    try {
        $mine = isset($_GET['mine']) && $_GET['mine'] == '1';
        $userId = $_SESSION['user_id'] ?? null;

        $query = "
            SELECT b.*, 
                   b.start_time as start, b.end_time as end, 
                   r.name as room_name, r.photo_url as room_base_photo, 
                   u.username, u.fullname
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN users u ON b.user_id = u.id
        ";

        if ($mine && $userId) {
            $query .= " WHERE b.user_id = ? ORDER BY b.created_at DESC";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$userId]);
        } else {
            $query .= " WHERE b.status != 'rejected' ORDER BY b.start_time ASC";
            $stmt = $pdo->query($query);
        }
        
        $bookings = $stmt->fetchAll();
        
        // Add color and main photo
        foreach ($bookings as &$b) {
            $b['backgroundColor'] = ($b['status'] === 'approved') ? '#28a745' : '#ffc107';
            $b['borderColor'] = $b['backgroundColor'];

            // Get the actual uploaded main photo if exists
            $stmtPhoto = $pdo->prepare("SELECT file_path FROM room_photos WHERE room_id = ? AND is_main = 1 LIMIT 1");
            $stmtPhoto->execute([$b['room_id']]);
            $main = $stmtPhoto->fetchColumn();
            if (!$main) {
                $stmtPhoto = $pdo->prepare("SELECT file_path FROM room_photos WHERE room_id = ? ORDER BY created_at ASC LIMIT 1");
                $stmtPhoto->execute([$b['room_id']]);
                $main = $stmtPhoto->fetchColumn();
            }
            $b['room_photo'] = $main ?: $b['room_base_photo'];
        }
        
        sendResponse($bookings);
    } catch (Exception $e) {
        sendResponse(['error' => 'Failed to fetch bookings: ' . $e->getMessage()], 500);
    }
}

requireLogin();

if ($method === 'POST') {
    try {
        $roomId = $input['room_id'] ?? null;
        $title = $input['title'] ?? '';
        $start = $input['start_time'] ?? '';
        $end = $input['end_time'] ?? '';
        $userId = $_SESSION['user_id'];

        if (!$roomId || !$start || !$end || empty($title)) {
            sendResponse(['error' => 'Missing required fields'], 400);
        }

        // ... (rest of input handling)
        $position = $input['position'] ?? '';
        $department = $input['department'] ?? '';
        $phone = $input['phone'] ?? '';
        $participants = $input['participants_count'] ?? 0;
        $setup_p = $input['setup_participants'] ?? 0;
        $setup_s = $input['setup_speakers'] ?? 0;
        $setup_sn = $input['setup_snacks'] ?? 0;
        $setup_r = $input['setup_registration'] ?? 0;
        $eq_audio = !empty($input['equip_audio']) ? 1 : 0;
        $eq_proj = !empty($input['equip_projector']) ? 1 : 0;
        $eq_vis = !empty($input['equip_visualizer']) ? 1 : 0;
        $eq_other = $input['equip_other'] ?? '';
        $layout = $input['room_layout'] ?? 'A';
        $prep_s = !empty($input['prep_start']) ? $input['prep_start'] : null;
        $prep_e = !empty($input['prep_end']) ? $input['prep_end'] : null;
        
        // External enhancement fields
        $purpose_type = $input['purpose_type'] ?? 'meeting';
        $address = $input['address'] ?? '';
        $line_id = $input['line_id'] ?? '';
        $attachment_path = $input['attachment_path'] ?? null;

        // 3-day advance booking check
        $minDate = new DateTime('+3 days');
        $minDate->setTime(0, 0, 0);
        $bookingDate = new DateTime($start);
        if ($bookingDate < $minDate) {
            sendResponse(['error' => 'Bookings must be made at least 3 days in advance. (ต้องจองล่วงหน้าอย่างน้อย 3 วัน)'], 403);
        }

        // Double Booking Check (Overlap logic)
        $stmt = $pdo->prepare("
            SELECT b.title, u.username FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.room_id = ? 
            AND b.status != 'rejected'
            AND (
                (b.start_time < ? AND b.end_time > ?) OR
                (b.start_time < ? AND b.end_time > ?) OR
                (b.start_time >= ? AND b.end_time <= ?)
            )
            LIMIT 1
        ");
        $stmt->execute([$roomId, $end, $start, $end, $start, $start, $end]);
        $conflict = $stmt->fetch();
        
        if ($conflict) {
            sendResponse(['error' => "Conflict detected: This room is already booked for '{$conflict['title']}' by {$conflict['username']} during this time."], 409);
        }

        $sql = "INSERT INTO bookings (
            room_id, user_id, title, purpose_type, position, department, address, line_id, phone, 
            participants_count, setup_participants, setup_speakers, 
            setup_snacks, setup_registration, equip_audio, 
            equip_projector, equip_visualizer, equip_other, 
            room_layout, prep_start, prep_end, start_time, end_time, attachment_path, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $roomId, $userId, $title, $purpose_type, $position, $department, $address, $line_id, $phone,
            $participants, $setup_p, $setup_s, $setup_sn, $setup_r,
            $eq_audio, $eq_proj, $eq_vis, $eq_other,
            $layout, $prep_s, $prep_e, $start, $end, $attachment_path
        ]);
        
        $bookingId = $pdo->lastInsertId();

        // Telegram Notification
        try {
            require_once __DIR__ . '/../includes/telegram.php';
            $stmt = $pdo->prepare("SELECT name FROM rooms WHERE id = ?");
            $stmt->execute([$roomId]);
            $roomName = $stmt->fetchColumn();
            
            $uType = $_SESSION['user_type'] ?? 'internal';
            $uOrg = ($uType === 'external') ? $organization : $department;

            $message = "<b>📅 New Booking Request!</b>\n";
            $message .= "Title: $title\n";
            $message .= "Room: $roomName\n";
            $message .= "Time: $start to $end\n";
            $message .= "User: " . $_SESSION['username'] . " (" . strtoupper($uType) . ")\n";
            $message .= "Org/Dept: $uOrg";
            
            sendTelegramNotification($message);

            // LINE Notification for User
            try {
                require_once __DIR__ . '/../includes/line.php';
                // Get user's line_user_id
                $stmtLine = $pdo->prepare("SELECT line_user_id FROM users WHERE id = ?");
                $stmtLine->execute([$userId]);
                $userLineId = $stmtLine->fetchColumn();

                if ($userLineId) {
                    $lineMsg = "📅 คุณส่งคำขอจองห้องเรียบร้อยแล้ว\n";
                    $lineMsg .= "หัวข้อ: $title\n";
                    $lineMsg .= "ห้อง: $roomName\n";
                    $lineMsg .= "เวลา: $start - $end\n";
                    $lineMsg .= "สถานะ: รอการอนุมัติ";
                    sendLineNotification($userLineId, $lineMsg);
                }
            } catch (Exception $le) {
                error_log("LINE Notification failed: " . $le->getMessage());
            }

            // Email Notification
            require_once __DIR__ . '/../includes/email.php';
            $stmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'smtp_user'");
            $adminEmail = $stmt->fetchColumn();
            if ($adminEmail) {
                $subject = "New Room Booking: $title";
                $html = "<h3>New Room Booking Request</h3>";
                $html .= "<ul>";
                $html .= "<li><b>Event:</b> $title</li>";
                $html .= "<li><b>Room:</b> $roomName</li>";
                $html .= "<li><b>Time:</b> $start - $end</li>";
                $html .= "<li><b>User:</b> {$_SESSION['username']} ($uType)</li>";
                $html .= "<li><b>Organization:</b> $uOrg</li>";
                $html .= "</ul>";
                $html .= "<p><a href='http://localhost/thanonroom20042569/'>คลิกเพื่อเข้าสู่ระบบไปจัดการ</a></p>";
                sendEmailNotification($adminEmail, $subject, $html);
            }
        } catch (Exception $e) {
            error_log("Notification failed: " . $e->getMessage());
        }

        logAction('BOOKING_CREATED', "New booking: $title (Room ID: $roomId)");
        sendResponse(['success' => true, 'id' => $bookingId]);

    } catch (Exception $e) {
        logAction('BOOKING_FAILED', "Error: " . $e->getMessage());
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

if ($method === 'PATCH') {
    try {
        $id = $input['id'] ?? null;
        $action = $input['action'] ?? '';

        // Action: Check-in
        if ($action === 'check_in') {
            $stmt = $pdo->prepare("UPDATE bookings SET check_in_time = NOW() WHERE id = ?");
            $stmt->execute([$id]);
            logAction('BOOKING_CHECKIN', "Booking ID $id checked in");
            sendResponse(['success' => true]);
        }

        // Action: Check-out with Rating
        if ($action === 'check_out') {
            $rating = $input['rating'] ?? 0;
            $feedback = $input['feedback'] ?? '';
            $stmt = $pdo->prepare("UPDATE bookings SET check_out_time = NOW(), rating = ?, feedback = ? WHERE id = ?");
            $stmt->execute([$rating, $feedback, $id]);
            logAction('BOOKING_CHECKOUT', "Booking ID $id checked out with rating $rating");

            // LINE Rating Request
            try {
                require_once __DIR__ . '/../includes/line.php';
                $stmtLine = $pdo->prepare("SELECT u.line_user_id, b.title FROM bookings b JOIN users u ON b.user_id = u.id WHERE b.id = ?");
                $stmtLine->execute([$id]);
                $info = $stmtLine->fetch();

                if ($info && $info['line_user_id']) {
                    $quickReply = [
                        'type' => 'text',
                        'text' => "🏢 การใช้งานห้อง '{$info['title']}' เสร็จสิ้นแล้ว\nกรุณาให้คะแนนความพึงพอใจเพื่อนำไปปรับปรุงการบริการครับ",
                        'quickReply' => [
                            'items' => [
                                ['type' => 'action', 'action' => ['type' => 'message', 'label' => '⭐ 5 ดีมาก', 'text' => "RATING:5:$id"]],
                                ['type' => 'action', 'action' => ['type' => 'message', 'label' => '⭐ 4 ดี', 'text' => "RATING:4:$id"]],
                                ['type' => 'action', 'action' => ['type' => 'message', 'label' => '⭐ 3 ปานกลาง', 'text' => "RATING:3:$id"]],
                                ['type' => 'action', 'action' => ['type' => 'message', 'label' => '⭐ 2 พอใช้', 'text' => "RATING:2:$id"]],
                                ['type' => 'action', 'action' => ['type' => 'message', 'label' => '⭐ 1 ควรปรับปรุง', 'text' => "RATING:1:$id"]],
                            ]
                        ]
                    ];
                    sendLineNotification($info['line_user_id'], $quickReply);
                }
            } catch (Exception $le) {
                error_log("LINE Rating Request failed: " . $le->getMessage());
            }

            sendResponse(['success' => true]);
        }

        requireRole(['admin', 'approver']);
        
        $status = $input['status'] ?? null;
        $total_amount = $input['total_amount'] ?? null;
        $deposit_amount = $input['deposit_amount'] ?? null;
        $payment_status = $input['payment_status'] ?? null;

        $updateFields = [];
        $params = [];

        if ($status !== null) { $updateFields[] = "status = ?"; $params[] = $status; }
        if ($total_amount !== null) { $updateFields[] = "total_amount = ?"; $params[] = $total_amount; }
        if ($deposit_amount !== null) { $updateFields[] = "deposit_amount = ?"; $params[] = $deposit_amount; }
        if ($payment_status !== null) { $updateFields[] = "payment_status = ?"; $params[] = $payment_status; }

        if (empty($updateFields)) {
            sendResponse(['error' => 'No fields to update'], 400);
        }

        $params[] = $id;
        $sql = "UPDATE bookings SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Telegram Notification for Status Change (Only if status was changed)
        if ($status !== null) {
            try {
            require_once __DIR__ . '/../includes/telegram.php';
            $stmt = $pdo->prepare("
                SELECT b.title, r.name as room_name, u.username, u.fullname 
                FROM bookings b 
                JOIN rooms r ON b.room_id = r.id 
                JOIN users u ON b.user_id = u.id
                WHERE b.id = ?
            ");
            $stmt->execute([$id]);
            $info = $stmt->fetch();

            if ($info) {
                $statusEmoji = $status === 'approved' ? '✅' : '❌';
                $statusText = strtoupper($status);
                $message = "<b>Booking Update!</b> $statusEmoji\n";
                $message .= "Title: {$info['title']}\n";
                $message .= "Room: {$info['room_name']}\n";
                $message .= "User: " . ($info['fullname'] ?: $info['username']) . "\n";
                $message .= "New Status: <b>$statusText</b>\n";
                $message .= "Changed by: {$_SESSION['username']}";

                sendTelegramNotification($message);

                // LINE Notification for User on Status Update
                try {
                    require_once __DIR__ . '/../includes/line.php';
                    $stmtLine = $pdo->prepare("SELECT line_user_id FROM users WHERE username = ?");
                    $stmtLine->execute([$info['username']]);
                    $userLineId = $stmtLine->fetchColumn();

                    if ($userLineId) {
                        $statusEmoji = $status === 'approved' ? '✅' : '❌';
                        $statusText = $status === 'approved' ? 'อนุมัติแล้ว' : 'ไม่ได้รับการอนุมัติ';
                        $lineMsg = "📢 แจ้งเตือนสถานะการจอง $statusEmoji\n";
                        $lineMsg .= "หัวข้อ: {$info['title']}\n";
                        $lineMsg .= "ห้อง: {$info['room_name']}\n";
                        $lineMsg .= "สถานะใหม่: $statusText";
                        
                        if ($status === 'approved') {
                            $lineMsg .= "\n\nกรุณาเตรียมความพร้อมตามวันและเวลาที่กำหนดครับ";
                        }
                        
                        sendLineNotification($userLineId, $lineMsg);
                    }
                } catch (Exception $le) {
                    error_log("LINE Status Notification failed: " . $le->getMessage());
                }

                // Email Notification for User (YOLO Add)
                require_once __DIR__ . '/../includes/email.php';
                // Get user email
                $stmt = $pdo->prepare("SELECT email FROM users WHERE username = ?");
                $stmt->execute([$info['username']]);
                $userEmail = $stmt->fetchColumn();

                if ($userEmail) {
                    $subject = "Room Booking Update: {$info['title']}";
                    $statusColor = $status === 'approved' ? '#22c55e' : '#ef4444';
                    $html = "<p>Your room booking has been updated.</p>";
                    $html .= "<p>Status: <b style='color:$statusColor'>".strtoupper($status)."</b></p>";
                    $html .= "<ul><li><b>Event:</b> {$info['title']}</li><li><b>Room:</b> {$info['room_name']}</li></ul>";
                    sendEmailNotification($userEmail, $subject, $html);
                }
            }
        } catch (Exception $e) {
            error_log("Telegram Status Update Notification failed: " . $e->getMessage());
        }

        logAction('BOOKING_STATUS_CHANGED', "Booking ID $id changed to $status by {$_SESSION['username']}");
        
        sendResponse(['success' => true]);
    } catch (Exception $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

if ($method === 'DELETE') {
    try {
        $id = $_GET['id'] ?? null;
        if (!$id) sendResponse(['error' => 'ID required'], 400);

        // Fetch booking to check ownership
        $stmt = $pdo->prepare("SELECT user_id, status FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();

        if (!$booking) sendResponse(['error' => 'Booking not found'], 404);

        $isAdmin = in_array($_SESSION['role'], ['admin', 'approver']);
        $isOwner = $booking['user_id'] == $_SESSION['user_id'];

        if ($isAdmin || ($isOwner && $booking['status'] === 'pending')) {
            $stmt = $pdo->prepare("DELETE FROM bookings WHERE id = ?");
            $stmt->execute([$id]);
            logAction('BOOKING_CANCELLED', "Booking ID $id removed by {$_SESSION['username']}");
            sendResponse(['success' => true]);
        } else {
            sendResponse(['error' => 'Permission denied or booking cannot be cancelled'], 403);
        }
    } catch (Exception $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

sendResponse(['error' => 'Method not allowed'], 405);
