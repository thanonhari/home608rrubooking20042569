<?php
require_once 'includes/db.php';
try {
    echo "--- Self-Update Security Test (No Log Fix Attempt) ---\n";
    $username = 'test_nolog_user';
    $pdo->prepare("DELETE FROM users WHERE username = ?")->execute([$username]);
    $pdo->prepare("INSERT INTO users (username, password_hash, role, status, fullname) VALUES (?, 'hash', 'user', 'active', 'Original')")->execute([$username, 'hash']);
    $userId = $pdo->lastInsertId();

    $input = ['prefix'=>'นาย', 'fullname'=>'NoLogTest', 'position'=>'Dev', 'department'=>'IT', 'phone'=>'123'];

    // LOGIC FROM api/profile.php
    $sql = "UPDATE users SET `prefix` = ".$pdo->quote($input['prefix']).", `fullname` = ".$pdo->quote($input['fullname']).", `position` = ".$pdo->quote($input['position']).", `department` = ".$pdo->quote($input['department']).", `phone` = ".$pdo->quote($input['phone'])." WHERE `id` = $userId";
    
    echo "Executing UPDATE without LogAction...\n";
    $pdo->exec($sql); // NO PREPARE, NO PARAMETERS!

    $u = $pdo->query("SELECT * FROM users WHERE id = $userId")->fetch();
    echo "Resulting Role: " . $u['role'] . "\n";
    echo ($u['role'] === 'user' ? "✅ PASS: Update Successful without LogAction error\n" : "❌ FAIL: Still failed\n");

    $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);
} catch (Exception $e) { echo "ERROR: " . $e->getMessage(); }
?>
