<?php
require_once __DIR__ . '/../includes/db.php';
$stmt = $pdo->query("SELECT id, username, user_type, department, position, organization FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
