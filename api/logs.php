<?php
// api/logs.php
require_once __DIR__ . '/base.php';

requireRole('admin');

$stmt = $pdo->query("
    SELECT l.*, u.username 
    FROM audit_logs l 
    LEFT JOIN users u ON l.user_id = u.id 
    ORDER BY l.created_at DESC 
    LIMIT 100
");

sendResponse($stmt->fetchAll());

