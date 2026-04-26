<?php
// api/register.php - Ultimate Master Data Sync Fix
require_once __DIR__ . '/base.php';

$input = getInput();
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';
$prefix = trim($input['prefix'] ?? '');
$fullname = trim($input['fullname'] ?? '');
$position = trim($input['position'] ?? '');
$department = trim($input['department'] ?? '');
$phone = trim($input['phone'] ?? '');
$email = trim($input['email'] ?? '');
$user_type = trim($input['user_type'] ?? 'internal');
$organization = trim($input['organization'] ?? '');
$address = trim($input['address'] ?? '');
$line_id = trim($input['line_id'] ?? '');

if (empty($username) || empty($password) || empty($fullname)) {
    sendResponse(['error' => 'Required fields missing'], 400);
}

if (strlen($password) < 6) {
    sendResponse(['error' => 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร (Password must be at least 6 characters)'], 400);
}

if ($user_type === 'external' && empty($organization)) {
    sendResponse(['error' => 'กรุณาระบุชื่อหน่วยงาน/องค์กร (Organization is required for external users)'], 400);
}

// Check if username already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    sendResponse(['error' => 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว (Username already exists)'], 400);
}

// Create user
$hash = password_hash($password, PASSWORD_BCRYPT);
try {
    $pdo->beginTransaction();

    // 1. Sync Department to Master Data (Only for internal users)
    if ($user_type === 'internal' && !empty($department)) {
        $checkDept = $pdo->prepare("SELECT id FROM departments WHERE name = ?");
        $checkDept->execute([$department]);
        if (!$checkDept->fetch()) {
            $pdo->prepare("INSERT INTO departments (name) VALUES (?)")->execute([$department]);
        }
    }

    // 2. Sync Position to Master Data (Only for internal users)
    if ($user_type === 'internal' && !empty($position)) {
        $checkPos = $pdo->prepare("SELECT id FROM positions WHERE name = ?");
        $checkPos->execute([$position]);
        if (!$checkPos->fetch()) {
            $pdo->prepare("INSERT INTO positions (name) VALUES (?)")->execute([$position]);
        }
    }

    // 3. Create user record
    $stmt = $pdo->prepare("INSERT INTO users (username, prefix, fullname, password_hash, role, user_type, status, position, department, organization, address, line_id, phone, email) VALUES (?, ?, ?, ?, 'user', ?, 'pending', ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$username, $prefix, $fullname, $hash, $user_type, $position, $department, $organization, $address, $line_id, $phone, $email]);
    
    $pdo->commit();
    logAction('USER_REGISTERED', "New registration: $username ($user_type: " . ($user_type === 'internal' ? $department : $organization) . ")");
    
    // Notify Admin about new registration
    try {
        require_once __DIR__ . '/../includes/telegram.php';
        $msg = "<b>🆕 New User Registration!</b>\n";
        $msg .= "Username: $username\n";
        $msg .= "Name: $fullname\n";
        $msg .= "Type: " . strtoupper($user_type) . "\n";
        $msg .= "Org/Dept: " . ($user_type === 'external' ? $organization : $department) . "\n";
        $msg .= "Status: <b>PENDING APPROVAL</b>";
        sendTelegramNotification($msg);

        require_once __DIR__ . '/../includes/email.php';
        $stmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'smtp_user'");
        $adminEmail = $stmt->fetchColumn();
        if ($adminEmail) {
            $subject = "New User Registration: $username";
            $html = "<h3>New User Awaiting Approval</h3>";
            $html .= "<ul><li><b>Username:</b> $username</li><li><b>Full Name:</b> $fullname</li><li><b>Type:</b> $user_type</li></ul>";
            $html .= "<p><a href='http://localhost/thanonroom20042569/'>คลิกเพื่อเข้าสู่ระบบไปอนุมัติ</a></p>";
            sendEmailNotification($adminEmail, $subject, $html);
        }
    } catch (Exception $e) {
        error_log("Registration Notification failed: " . $e->getMessage());
    }

    sendResponse(['success' => true, 'message' => 'Registration successful. Awaiting admin approval.']);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendResponse(['error' => 'Registration failed: ' . $e->getMessage()], 500);
}
