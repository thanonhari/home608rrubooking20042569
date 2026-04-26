<?php
// api/bookings.php
require_once __DIR__ . '/base.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = getInput();

if ($method === 'GET') {
    try {
        $action = $_GET['action'] ?? '';
        $id = $_GET['id'] ?? null;

        if ($id && $action !== 'generate_pdf') {
            $stmt = $pdo->prepare("SELECT b.*, r.name as room_name, u.fullname, u.username, u.email, u.phone 
                                 FROM bookings b 
                                 JOIN rooms r ON b.room_id = r.id 
                                 JOIN users u ON b.user_id = u.id 
                                 WHERE b.id = ?");
            $stmt->execute([$id]);
            $booking = $stmt->fetch();
            if ($booking && isset($booking['extra_services'])) {
                $booking['extra_services'] = json_decode($booking['extra_services'], true);
            }
            sendResponse($booking);
        }
        
        if ($action === 'generate_pdf') {
            requireLogin();
            $id = $_GET['id'] ?? null;
            if (!$id) sendResponse(['error' => 'ID required'], 400);

            // Trigger node script
            $scriptPath = realpath(__DIR__ . '/../scripts/generate_pdf.js');
            $command = "node \"$scriptPath\" " . escapeshellarg($id);
            $output = shell_exec($command);
            
            $fileName = "BK-" . str_pad($id, 6, '0', STR_PAD_LEFT) . ".pdf";
            $filePath = __DIR__ . "/../uploads/invoices/" . $fileName;

            if (file_exists($filePath)) {
                if (ob_get_length()) ob_clean();
                header('Content-Type: application/pdf');
                header('Content-Disposition: attachment; filename="' . $fileName . '"');
                readfile($filePath);
                exit;
            } else {
                sendResponse(['error' => 'PDF generation failed', 'output' => $output], 500);
            }
        }

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
        // Security Hardening: Strict Validation
        validate($input, [
            'room_id' => 'required|numeric',
            'title' => 'required|min:3',
            'start_time' => 'required',
            'end_time' => 'required'
        ]);

        $roomId = $input['room_id'];
        $title = $input['title'];
        $start = $input['start_time'];
        $end = $input['end_time'];
        $userId = $_SESSION['user_id'];

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

        // Notifications
        try {
            require_once __DIR__ . '/../includes/telegram.php';
            $stmt = $pdo->prepare("SELECT name FROM rooms WHERE id = ?");
            $stmt->execute([$roomId]);
            $roomName = $stmt->fetchColumn();
            
            $uType = $_SESSION['user_type'] ?? 'internal';

            $message = "<b>📅 New Booking Request!</b>\n";
            $message .= "Title: $title\n";
            $message .= "Room: $roomName\n";
            $message .= "Time: $start to $end\n";
            $message .= "User: " . $_SESSION['username'] . " (" . strtoupper($uType) . ")\n";
            
            sendTelegramNotification($message);

            // LINE Notification
            try {
                require_once __DIR__ . '/../includes/line.php';
                $stmtLine = $pdo->prepare("SELECT line_user_id FROM users WHERE id = ?");
                $stmtLine->execute([$userId]);
                $userLineId = $stmtLine->fetchColumn();

                if ($userLineId) {
                    $lineMsg = "📅 คุณส่งคำขอจองห้องเรียบร้อยแล้ว\nหัวข้อ: $title\nห้อง: $roomName\nเวลา: $start - $end\nสถานะ: รอการอนุมัติ";
                    sendLineNotification($userLineId, $lineMsg);
                }
            } catch (Exception $le) {}

            // Email Notification
            require_once __DIR__ . '/../includes/email.php';
            $stmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'smtp_user'");
            $adminEmail = $stmt->fetchColumn();
            if ($adminEmail) {
                $subject = "New Room Booking: $title";
                $html = "<h3>New Room Booking Request</h3><ul><li>Event: $title</li><li>Room: $roomName</li></ul>";
                sendEmailNotification($adminEmail, $subject, $html);
            }
        } catch (Exception $e) {}

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

        if ($action === 'check_in') {
            $stmt = $pdo->prepare("UPDATE bookings SET check_in_time = NOW() WHERE id = ?");
            $stmt->execute([$id]);
            logAction('BOOKING_CHECKIN', "Booking ID $id checked in");
            sendResponse(['success' => true]);
        }

        if ($action === 'check_out') {
            $rating = $input['rating'] ?? 0;
            $feedback = $input['feedback'] ?? '';
            $stmt = $pdo->prepare("UPDATE bookings SET check_out_time = NOW(), rating = ?, feedback = ? WHERE id = ?");
            $stmt->execute([$rating, $feedback, $id]);
            logAction('BOOKING_CHECKOUT', "Booking ID $id checked out with rating $rating");
            sendResponse(['success' => true]);
        }

        requireRole(['admin', 'approver']);
        
        $status = $input['status'] ?? null;
        $total_amount = $input['total_amount'] ?? null;
        $deposit_amount = $input['deposit_amount'] ?? null;
        $payment_status = $input['payment_status'] ?? null;
        $doc_ref_no = $input['doc_ref_no'] ?? null;
        $receipt_no = $input['receipt_no'] ?? null;
        $extra_services = isset($input['extra_services']) ? json_encode($input['extra_services'], JSON_UNESCAPED_UNICODE) : null;

        $updateFields = []; $params = [];
        if ($status !== null) { $updateFields[] = "status = ?"; $params[] = $status; }
        if ($total_amount !== null) { $updateFields[] = "total_amount = ?"; $params[] = $total_amount; }
        if ($deposit_amount !== null) { $updateFields[] = "deposit_amount = ?"; $params[] = $deposit_amount; }
        if ($payment_status !== null) { $updateFields[] = "payment_status = ?"; $params[] = $payment_status; }
        if ($doc_ref_no !== null) { $updateFields[] = "doc_ref_no = ?"; $params[] = $doc_ref_no; }
        if ($receipt_no !== null) { $updateFields[] = "receipt_no = ?"; $params[] = $receipt_no; }
        if ($extra_services !== null) { $updateFields[] = "extra_services = ?"; $params[] = $extra_services; }

        if (empty($updateFields)) sendResponse(['error' => 'No fields to update'], 400);

        $params[] = $id;
        $sql = "UPDATE bookings SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $pdo->prepare($sql)->execute($params);

        if ($status !== null) {
            try {
                require_once __DIR__ . '/../includes/telegram.php';
                $stmt = $pdo->prepare("SELECT b.title, r.name as room_name, u.username, u.fullname FROM bookings b JOIN rooms r ON b.room_id = r.id JOIN users u ON b.user_id = u.id WHERE b.id = ?");
                $stmt->execute([$id]);
                $info = $stmt->fetch();
                if ($info) {
                    $statusText = strtoupper($status);
                    sendTelegramNotification("<b>Booking Update!</b>\nTitle: {$info['title']}\nStatus: $statusText");
                }
            } catch (Exception $e) {}
        }

        logAction('BOOKING_STATUS_CHANGED', "Booking ID $id changed to $status");
        sendResponse(['success' => true]);
    } catch (Exception $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

if ($method === 'DELETE') {
    try {
        $id = $_GET['id'] ?? null;
        if (!$id) sendResponse(['error' => 'ID required'], 400);
        $stmt = $pdo->prepare("SELECT user_id, status FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();
        if (!$booking) sendResponse(['error' => 'Booking not found'], 404);

        $isAdmin = in_array($_SESSION['role'], ['admin', 'approver']);
        $isOwner = $booking['user_id'] == ($_SESSION['user_id'] ?? 0);

        if ($isAdmin || ($isOwner && $booking['status'] === 'pending')) {
            $pdo->prepare("DELETE FROM bookings WHERE id = ?")->execute([$id]);
            logAction('BOOKING_CANCELLED', "Booking ID $id removed");
            sendResponse(['success' => true]);
        } else {
            sendResponse(['error' => 'Permission denied'], 403);
        }
    } catch (Exception $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

sendResponse(['error' => 'Method not allowed'], 405);
