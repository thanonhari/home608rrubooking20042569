<?php
// api/dev_login.php
require_once __DIR__ . '/base.php';

$input = getInput();
$role = $input['role'] ?? '';

try {
    if ($role === 'admin') {
        $_SESSION['user_id'] = 2;
        $_SESSION['username'] = 'admin';
        $_SESSION['role'] = 'admin';
        $_SESSION['user_type'] = 'internal';
    } else if ($role === 'staff') {
        $_SESSION['user_id'] = 5;
        $_SESSION['username'] = 'test_staff';
        $_SESSION['role'] = 'staff';
        $_SESSION['user_type'] = 'internal';
    } else if ($role === 'approver') {
        $_SESSION['user_id'] = 999;
        $_SESSION['username'] = 'test_approver';
        $_SESSION['role'] = 'approver';
        $_SESSION['user_type'] = 'internal';
    } else if ($role === 'user_internal') {
        $_SESSION['user_id'] = 1;
        $_SESSION['username'] = 'thanon';
        $_SESSION['role'] = 'user';
        $_SESSION['user_type'] = 'internal';
    } else if ($role === 'user_gov') {
        $_SESSION['user_id'] = 101;
        $_SESSION['username'] = 'gov_tester';
        $_SESSION['role'] = 'user';
        $_SESSION['user_type'] = 'gov';
    } else if ($role === 'user_external') {
        $_SESSION['user_id'] = 102;
        $_SESSION['username'] = 'external_tester';
        $_SESSION['role'] = 'user';
        $_SESSION['user_type'] = 'external';
    } else {
        sendResponse(['error' => 'Invalid role'], 400);
    }

    // Force update session variable for consistency
    $_SESSION['fullname'] = 'Test ' . ucfirst(str_replace('user_', '', $role));
    
    sendResponse(['success' => true]);
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}
