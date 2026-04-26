<?php
// scripts/list_users.php
require_once __DIR__ . '/../api/base.php';

$stmt = $pdo->query("SELECT id, username, role, status FROM users");
$users = $stmt->fetchAll();

echo "--- User List ---\n";
foreach ($users as $u) {
    echo "ID: {$u['id']} | User: {$u['username']} | Role: {$u['role']} | Status: {$u['status']}\n";
}
echo "-----------------\n";
