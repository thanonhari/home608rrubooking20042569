<?php
// api/stats.php
require_once __DIR__ . '/base.php';

requireRole(['admin', 'approver']);

$stats = [];

// 0. Summary Stats
$stats['summary'] = [
    'total_rooms' => $pdo->query("SELECT COUNT(*) FROM rooms")->fetchColumn(),
    'active_users' => $pdo->query("SELECT COUNT(*) FROM users WHERE status = 'active'")->fetchColumn(),
    'total_bookings' => $pdo->query("SELECT COUNT(*) FROM bookings")->fetchColumn(),
    'pending_bookings' => $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'")->fetchColumn()
];

// 1. Bookings per room
$stmt = $pdo->query("
    SELECT r.name, COUNT(b.id) as total 
    FROM rooms r 
    LEFT JOIN bookings b ON r.id = b.room_id AND b.status != 'rejected'
    GROUP BY r.id
    ORDER BY total DESC
    LIMIT 10
");
$stats['room_usage'] = $stmt->fetchAll();

// 2. Status distribution
$stmt = $pdo->query("SELECT status, COUNT(*) as count FROM bookings GROUP BY status");
$stats['status_dist'] = $stmt->fetchAll();

// 3. Top users
$stmt = $pdo->query("
    SELECT u.username, COUNT(b.id) as total 
    FROM users u 
    JOIN bookings b ON u.id = b.user_id 
    GROUP BY u.id 
    ORDER BY total DESC 
    LIMIT 5
");
$stats['top_users'] = $stmt->fetchAll();

sendResponse($stats);
