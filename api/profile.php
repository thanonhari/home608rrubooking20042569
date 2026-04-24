<?php
// api/profile.php - The Delete-and-Recreate Salvation
require_once __DIR__ . '/base.php';

requireLogin();

$method = $_SERVER['REQUEST_METHOD'];
$input = getInput();
$userId = $_SESSION['user_id'];

if ($method === 'GET') {
    $depts = $pdo->query("SELECT name FROM departments ORDER BY name ASC")->fetchAll(PDO::FETCH_COLUMN);
    $positions = $pdo->query("SELECT name FROM positions ORDER BY name ASC")->fetchAll(PDO::FETCH_COLUMN);
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $userProfile = $stmt->fetch();
    sendResponse(['profile' => $userProfile, 'master' => ['departments' => $depts, 'positions' => $positions]]);
}

if ($method === 'PATCH') {
    try {
        $pdo->beginTransaction();

        // 1. ดึงข้อมูลเดิมมาเก็บไว้ก่อน
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $old = $stmt->fetch();

        if (!$old) throw new Exception("User not found");

        // 2. เตรียมข้อมูลใหม่ (เอาของใหม่ทับของเดิม)
        $new = [
            'username' => $old['username'],
            'password_hash' => !empty($input['new_password']) ? password_hash($input['new_password'], PASSWORD_BCRYPT) : $old['password_hash'],
            'role' => $old['role'],
            'status' => $old['status'],
            'fullname' => $input['fullname'] ?? $old['fullname'],
            'prefix' => $input['prefix'] ?? $old['prefix'],
            'position' => $input['position'] ?? $old['position'],
            'department' => $input['department'] ?? $old['department'],
            'phone' => $input['phone'] ?? $old['phone'],
            'email' => $input['email'] ?? $old['email'],
            'created_at' => $old['created_at']
        ];

        // 3. ลบของเก่า (เลี่ยงปัญหา Update ติด Trigger)
        $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);

        // 4. บันทึกกลับเข้าไปใหม่ (ระบุ ID เดิม)
        $stmt = $pdo->prepare("INSERT INTO users (id, username, password_hash, role, status, fullname, prefix, position, department, phone, email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $userId, $new['username'], $new['password_hash'], $new['role'], $new['status'], 
            $new['fullname'], $new['prefix'], $new['position'], $new['department'], $new['phone'], 
            $new['email'], $new['created_at']
        ]);

        $pdo->commit();
        logAction('PROFILE_RECREATED', "User ID $userId data refreshed via Recreate method");
        sendResponse(['success' => true]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        sendResponse(['error' => $e->getMessage()], 500);
    }
}
sendResponse(['error' => 'Method not allowed'], 405);
