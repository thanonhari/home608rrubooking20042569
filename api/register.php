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

if (empty($username) || empty($password) || empty($fullname)) {
    sendResponse(['error' => 'Required fields missing'], 400);
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

    // 1. Sync Department to Master Data
    if (!empty($department)) {
        $checkDept = $pdo->prepare("SELECT id FROM departments WHERE name = ?");
        $checkDept->execute([$department]);
        if (!$checkDept->fetch()) {
            $pdo->prepare("INSERT INTO departments (name) VALUES (?)")->execute([$department]);
        }
    }

    // 2. Sync Position to Master Data
    if (!empty($position)) {
        $checkPos = $pdo->prepare("SELECT id FROM positions WHERE name = ?");
        $checkPos->execute([$position]);
        if (!$checkPos->fetch()) {
            $pdo->prepare("INSERT INTO positions (name) VALUES (?)")->execute([$position]);
        }
    }

    // 3. Create user record
    $stmt = $pdo->prepare("INSERT INTO users (username, prefix, fullname, password_hash, role, status, position, department, phone, email) VALUES (?, ?, ?, ?, 'user', 'pending', ?, ?, ?, ?)");
    $stmt->execute([$username, $prefix, $fullname, $hash, $position, $department, $phone, $email]);
    
    $pdo->commit();
    logAction('USER_REGISTERED', "New registration: $username ($department)");
    sendResponse(['success' => true, 'message' => 'Registration successful. Awaiting admin approval.']);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendResponse(['error' => 'Registration failed: ' . $e->getMessage()], 500);
}
