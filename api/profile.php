<?php
// api/profile.php - Standard Profile Update
require_once __DIR__ . '/base.php';

requireLogin();

$method = $_SERVER['REQUEST_METHOD'];
$input = getInput();
$userId = $_SESSION['user_id'];

if ($method === 'GET') {
    try {
        $depts = $pdo->query("SELECT name FROM departments ORDER BY name ASC")->fetchAll(PDO::FETCH_COLUMN);
        $positions = $pdo->query("SELECT name FROM positions ORDER BY name ASC")->fetchAll(PDO::FETCH_COLUMN);
        
        $stmt = $pdo->prepare("SELECT id, username, prefix, fullname, role, user_type, status, position, department, organization, address, line_id, phone, email, created_at FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $userProfile = $stmt->fetch();
        
        if (!$userProfile) {
            sendResponse(['error' => 'User not found'], 404);
        }
        
        sendResponse([
            'profile' => $userProfile, 
            'master' => ['departments' => $depts, 'positions' => $positions]
        ]);
    } catch (Exception $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

if ($method === 'PATCH') {
    try {
        // Fetch current data to preserve unsubmitted fields
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $old = $stmt->fetch();

        if (!$old) sendResponse(['error' => 'User not found'], 404);

        $fullname = trim($input['fullname'] ?? $old['fullname']);
        $prefix = trim($input['prefix'] ?? $old['prefix']);
        $phone = trim($input['phone'] ?? $old['phone']);
        $email = trim($input['email'] ?? $old['email']);
        $address = trim($input['address'] ?? ($old['address'] ?? ''));
        $line_id = trim($input['line_id'] ?? ($old['line_id'] ?? ''));
        $department = trim($input['department'] ?? ($old['department'] ?? ''));
        $position = trim($input['position'] ?? ($old['position'] ?? ''));
        $organization = trim($input['organization'] ?? ($old['organization'] ?? ''));

        $params = [$prefix, $fullname, $phone, $email, $address, $line_id, $department, $position, $organization];
        $sql = "UPDATE users SET prefix = ?, fullname = ?, phone = ?, email = ?, address = ?, line_id = ?, department = ?, position = ?, organization = ?";

        if (!empty($input['new_password'])) {
            $sql .= ", password_hash = ?";
            $params[] = password_hash($input['new_password'], PASSWORD_BCRYPT);
        }

        $sql .= " WHERE id = ?";
        $params[] = $userId;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        logAction('PROFILE_UPDATED', "User ID $userId updated their profile");
        sendResponse(['success' => true]);

    } catch (Exception $e) {
        sendResponse(['error' => 'Update failed: ' . $e->getMessage()], 500);
    }
}

sendResponse(['error' => 'Method not allowed'], 405);
