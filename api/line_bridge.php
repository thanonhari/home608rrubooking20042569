<?php
require_once 'base.php';

define('GAS_SECRET_KEY', 'RRU_LINE_SECURE_2026');
define('BANK_IMAGE_URL', 'https://ruroomapi.funkyforge.sbs/assets/img/bank_account.jpg');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['key']) || $data['key'] !== GAS_SECRET_KEY) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$lineUserId = $data['line_user_id'] ?? null;
$message = trim($data['message'] ?? '');
$action = $data['action'] ?? 'log';

if (!$lineUserId) {
    echo json_encode(['status' => 'error', 'message' => 'Missing LINE User ID']);
    exit;
}

try {
    $stmtUser = $pdo->prepare("SELECT id, name FROM users WHERE line_user_id = ?");
    $stmtUser->execute([$lineUserId]);
    $user = $stmtUser->fetch();

    // 1. ตรวจจับการให้คะแนน (RATING:คะแนน:ไอดีการจอง)
    if (stripos($message, 'RATING:') === 0) {
        $parts = explode(':', $message);
        $score = intval($parts[1] ?? 0);
        $bookingId = intval($parts[2] ?? 0);

        if ($score >= 1 && $score <= 5 && $bookingId > 0) {
            $stmtUpdate = $pdo->prepare("UPDATE bookings SET rating = ? WHERE id = ?");
            $stmtUpdate->execute([$score, $bookingId]);
            
            echo json_encode([
                'status' => 'success',
                'message' => "⭐ ขอบพระคุณสำหรับคะแนน $score ดาวครับ!\nความเห็นของท่านช่วยให้เราพัฒนาบริการให้ดียิ่งขึ้นครับ 🙏"
            ]);
            exit;
        }
    }

    // 2. กรณีผู้ใช้กดปุ่ม "แจ้งชำระเงิน"
    if ($message === 'แจ้งชำระเงิน') {
        echo json_encode([
            'status' => 'success',
            'messages' => [
                ['type' => 'text', 'text' => "💳 ท่านสามารถโอนเงินมัดจำ (50%) หรือยอดเต็ม ได้ที่บัญชีด้านล่างนี้ครับ"],
                ['type' => 'image', 'originalContentUrl' => BANK_IMAGE_URL, 'previewImageUrl' => BANK_IMAGE_URL],
                ['type' => 'text', 'text' => "เมื่อโอนเสร็จแล้ว กรุณาส่ง 'รูปภาพสลิป' เข้ามาได้เลยครับ"]
            ]
        ]);
        exit;
    }

    // 3. กรณีส่งสลิป (Action: payment_slip)
    if ($action === 'payment_slip' && isset($data['image_data'])) {
        if (!$user) {
            echo json_encode(['status' => 'success', 'message' => '❌ กรุณาเชื่อมต่อบัญชีก่อนส่งสลิป (พิมพ์ EMAIL:อีเมล)']);
            exit;
        }

        $stmtBooking = $pdo->prepare("SELECT id, title FROM bookings WHERE user_id = ? AND payment_status != 'paid' ORDER BY created_at DESC LIMIT 1");
        $stmtBooking->execute([$user['id']]);
        $booking = $stmtBooking->fetch();

        if (!$booking) {
            echo json_encode(['status' => 'success', 'message' => "❓ ไม่พบรายการจองที่รอชำระเงินของคุณ {$user['name']}"]);
            exit;
        }

        $imageData = base64_decode($data['image_data']);
        $fileName = 'slip_' . time() . '_' . uniqid() . '.jpg';
        $uploadDir = __DIR__ . '/../uploads/slips/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        file_put_contents($uploadDir . $fileName, $imageData);
        
        $updateStmt = $pdo->prepare("UPDATE bookings SET attachment_path = ?, payment_status = 'pending_verify' WHERE id = ?");
        $updateStmt->execute(['uploads/slips/' . $fileName, $booking['id']]);

        echo json_encode(['status' => 'success', 'message' => "✅ ได้รับสลิปเรียบร้อยแล้ว!\nรายการ: {$booking['title']}"]);
        exit;
    }

    // 4. กรณีผูกบัญชี (EMAIL:...)
    if (stripos($message, 'EMAIL:') === 0) {
        $email = trim(str_ireplace('EMAIL:', '', $message));
        $checkStmt = $pdo->prepare("SELECT name FROM users WHERE email = ?");
        $checkStmt->execute([$email]);
        $found = $checkStmt->fetch();

        if ($found) {
            $updateStmt = $pdo->prepare("UPDATE users SET line_user_id = ? WHERE email = ?");
            $updateStmt->execute([$lineUserId, $email]);
            echo json_encode(['status' => 'success', 'message' => "✅ เชื่อมต่อบัญชีคุณ {$found['name']} สำเร็จ!"]);
        } else {
            echo json_encode(['status' => 'success', 'message' => "❓ ไม่พบอีเมล $email ในระบบ"]);
        }
        exit;
    }

    // Default
    $name = $user ? $user['name'] : 'ผู้ใช้';
    echo json_encode(['status' => 'success', 'message' => "สวัสดีคุณ $name! ต้องการทำรายการอะไรแจ้งได้เลยครับ"]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
