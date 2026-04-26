<?php
// api/users.php
require_once __DIR__ . '/base.php';

requireRole('admin');

$method = $_SERVER['REQUEST_METHOD'];
$input = getInput();

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT id, username, prefix, fullname, role, user_type, status, position, department, organization, phone, email, created_at FROM users ORDER BY created_at DESC");
        sendResponse($stmt->fetchAll());
    } catch (Exception $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

if ($method === 'PATCH') {
    try {
        validate($input, [
            'id' => 'required|numeric'
        ]);
        
        $userId = $input['id'];

        // Dynamic update for all allowed fields
        $allowedFields = ['role', 'status', 'prefix', 'fullname', 'position', 'department', 'organization', 'user_type', 'phone', 'email'];
        $updates = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = ?";
                $params[] = $input[$field];
            }
        }

        if (empty($updates)) {
            sendResponse(['error' => 'No fields to update'], 400);
        }

        $params[] = $userId;
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        logAction('USER_UPDATED', "User ID $userId updated by admin");
        sendResponse(['success' => true]);
    } catch (Exception $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

if ($method === 'DELETE') {
    try {
        $userId = $_GET['id'] ?? null;
        if (!$userId) sendResponse(['error' => 'Missing user ID'], 400);

        if ($userId == $_SESSION['user_id']) {
            sendResponse(['error' => 'Cannot delete your own account'], 403);
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        logAction('USER_DELETED', "User ID $userId removed");
        sendResponse(['success' => true]);
    } catch (Exception $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

sendResponse(['error' => 'Method not allowed'], 405);
