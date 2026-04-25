<?php
// api/stats.php
require_once __DIR__ . '/base.php';

requireRole(['admin', 'approver', 'staff']);

$stats = [];

// 0. Summary Stats
$stats['summary'] = [
    'total_rooms' => $pdo->query("SELECT COUNT(*) FROM rooms")->fetchColumn(),
    'active_users' => $pdo->query("SELECT COUNT(*) FROM users WHERE status = 'active'")->fetchColumn(),
    'total_bookings' => $pdo->query("SELECT COUNT(*) FROM bookings")->fetchColumn(),
    'pending_bookings' => $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'")->fetchColumn(),
    // LINE Linkage Stat
    'line_linked_users' => $pdo->query("SELECT COUNT(*) FROM users WHERE line_user_id IS NOT NULL")->fetchColumn()
];

// 1. Satisfaction Stats (Rating) - NEW
$stats['rating_stats'] = [
    'average' => round($pdo->query("SELECT AVG(rating) FROM bookings WHERE rating > 0")->fetchColumn() ?: 0, 2),
    'distribution' => $pdo->query("SELECT rating as star, COUNT(*) as count FROM bookings WHERE rating > 0 GROUP BY rating ORDER BY star DESC")->fetchAll()
];

// 2. Financial Pipeline (Payment Status) - NEW
$stats['payment_status_dist'] = $pdo->query("
    SELECT payment_status, COUNT(*) as count 
    FROM bookings 
    WHERE status = 'approved' 
    GROUP BY payment_status
")->fetchAll();

// Revenue by User Type
$stats['revenue_by_user_type'] = $pdo->query("
    SELECT u.user_type, SUM(b.total_amount) as total 
    FROM bookings b 
    JOIN users u ON b.user_id = u.id 
    WHERE b.status = 'approved' AND b.total_amount > 0 
    GROUP BY u.user_type
")->fetchAll();

// 3. Room Usage
$stmt = $pdo->query("
    SELECT r.name, COUNT(b.id) as total 
    FROM rooms r 
    LEFT JOIN bookings b ON r.id = b.room_id AND b.status != 'rejected'
    GROUP BY r.id
    ORDER BY total DESC
    LIMIT 10
");
$stats['room_usage'] = $stmt->fetchAll();

// 4. Status distribution
$stmt = $pdo->query("SELECT status, COUNT(*) as count FROM bookings GROUP BY status");
$stats['status_dist'] = $stmt->fetchAll();

// 5. Monthly Revenue
$stmt = $pdo->query("
    SELECT DATE_FORMAT(start_time, '%Y-%m') as month, SUM(total_amount) as amount 
    FROM bookings 
    WHERE status = 'approved' AND total_amount > 0
    GROUP BY month 
    ORDER BY month ASC 
    LIMIT 12
");
$stats['revenue_monthly'] = $stmt->fetchAll();

// 6. Revenue by Room
$stmt = $pdo->query("
    SELECT r.name, SUM(b.total_amount) as total 
    FROM rooms r 
    JOIN bookings b ON r.id = b.room_id 
    WHERE b.status = 'approved' AND b.total_amount > 0
    GROUP BY r.id
    ORDER BY total DESC
");
$stats['revenue_by_room'] = $stmt->fetchAll();

sendResponse($stats);
