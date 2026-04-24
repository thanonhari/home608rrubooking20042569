<?php
// scripts/setup_test_users.php
require_once __DIR__ . '/../includes/db.php';

function createTestUser($pdo, $u, $p, $r, $type = 'internal', $org = '') {
    $hash = password_hash($p, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (username, password_hash, role, user_type, organization, status, fullname) VALUES (?, ?, ?, ?, ?, 'active', ?)");
    $stmt->execute([$u, $hash, $r, $type, $org, "Test $r"]);
    echo "User $u ($r) is ready.\n";
}

try {
    createTestUser($pdo, 'admin_test', 'admin123', 'admin');
    createTestUser($pdo, 'approver_test', 'app123', 'approver');
} catch (Exception $e) { echo "Setup failed: " . $e->getMessage(); }
