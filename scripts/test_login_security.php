<?php
// scripts/test_login_security.php
require_once __DIR__ . '/../api/base.php';

echo "--- Login Security Audit ---\n";

// 1. Check if passwords are hashed
$stmt = $pdo->query("SELECT password_hash FROM users LIMIT 1");
$hash = $stmt->fetchColumn();
if ($hash && password_get_info($hash)['algoName'] !== 'unknown') {
    echo "[PASS] Passwords are using modern hashing (" . password_get_info($hash)['algoName'] . ")\n";
} else {
    echo "[FAIL] Passwords might not be hashed correctly!\n";
}

// 2. Check for potential SQL Injection in auth.php
$authCode = file_get_contents(__DIR__ . '/../api/auth.php');
if (strpos($authCode, 'prepare("SELECT * FROM users WHERE username = ?")') !== false) {
    echo "[PASS] Prepared statements used for login lookup\n";
} else {
    echo "[WARNING] Check auth.php for raw SQL queries!\n";
}

// 3. Check for session_regenerate_id
if (strpos($authCode, 'session_regenerate_id') !== false) {
    echo "[PASS] session_regenerate_id() found in auth.php\n";
} else {
    echo "[ISSUE] session_regenerate_id() missing in auth.php (Risk: Session Fixation)\n";
}

// 4. Check for rate limiting / brute force protection
if (strpos($authCode, 'SLEEP') !== false || strpos($authCode, 'usleep') !== false) {
    echo "[INFO] Some delay logic found for failed logins\n";
} else {
    echo "[INFO] No deliberate delay for failed logins found\n";
}

// 5. Check Registration Validation
$regCode = file_get_contents(__DIR__ . '/../api/register.php');
if (strpos($regCode, 'strlen($password)') !== false) {
    echo "[INFO] Password length validation found\n";
} else {
    echo "[WARNING] No password length validation found in register.php\n";
}

echo "\n--- End of Audit ---\n";
