<?php
// api/dev_login.php
require_once __DIR__ . '/base.php';

// ONLY ALLOW IN LOCALHOST/DEV
if ($_SERVER['REMOTE_ADDR'] !== '127.0.0.1' && $_SERVER['REMOTE_ADDR'] !== '::1') {
    sendResponse(['error' => 'Dev mode only'], 403);
}

$input = getInput();
$role = $input['role'] ?? '';

if (!in_array($role, ['admin', 'approver', 'staff', 'user'])) {
    sendResponse(['error' => 'Invalid role'], 400);
}

// Find a user with this role
$stmt = $pdo->prepare("SELECT * FROM users WHERE role = ? AND status = 'active' LIMIT 1");
$stmt->execute([$role]);
$user = $stmt->fetch();

if (!$user) {
    // If no user found, create one automatically for testing
    $username = "test_$role";
    $password = "password123";
    $hash = password_hash($password, PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, role, status, fullname) VALUES (?, ?, ?, 'active', ?)");
    $stmt->execute([$username, $hash, $role, "Test " . ucfirst($role)]);
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
}

// Log them in
session_regenerate_id(true);
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['role'] = $user['role'];

logAction('DEV_LOGIN', "Dev quick login as {$user['role']} ({$user['username']})");

sendResponse(['success' => true, 'user' => $user]);
