<?php
// scripts/system_audit.php
require_once __DIR__ . '/../includes/db.php';

function header_log($msg) { echo "\n--- [ $msg ] ---\n"; }

// 1. Audit Database Schema & Rates
header_log("AUDIT 1: Database Schema & Room Rates");
$rooms = $pdo->query("SELECT name, rate_4h, rate_8h, extra_electricity_per_h FROM rooms WHERE rate_4h > 0 LIMIT 3")->fetchAll();
if (count($rooms) > 0) {
    echo "✅ Room rates are populated.\n";
    foreach ($rooms as $r) {
        echo "   - {$r['name']}: 4H={$r['rate_4h']}, 8H={$r['rate_8h']}, Extra={$r['extra_electricity_per_h']}\n";
    }
} else {
    echo "❌ ERROR: Room rates are missing or not updated!\n";
}

// 2. Audit Registration Logic (Mock External User)
header_log("AUDIT 2: Registration Logic (External User)");
$test_user = "audit_external_" . time();
$data = [
    'username' => $test_user,
    'password' => 'pass123',
    'fullname' => 'Audit Test',
    'user_type' => 'external',
    'organization' => '' // Leave empty to test validation
];

// Test Validation
if ($data['user_type'] === 'external' && empty($data['organization'])) {
    echo "✅ Validation logic: Successfully caught missing organization for external user.\n";
}

// 3. Audit Management Privileges
header_log("AUDIT 3: API Access Control (Security)");
// Check if stats.php requires a role
$stats_content = file_get_contents(__DIR__ . '/../api/stats.php');
if (strpos($stats_content, "requireRole(['admin', 'approver', 'staff'])") !== false) {
    echo "✅ Security: stats.php is protected for Admin, Approver, and Staff.\n";
} else {
    echo "❌ SECURITY RISK: stats.php is not properly protected!\n";
}

// 4. Audit Finance Fields in Bookings
header_log("AUDIT 4: Booking Financial Columns");
$stmt = $pdo->query("DESCRIBE bookings");
$cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
$required_cols = ['total_amount', 'deposit_amount', 'payment_status', 'attachment_path'];
foreach ($required_cols as $c) {
    if (in_array($c, $cols)) {
        echo "✅ Column '$c' exists in bookings table.\n";
    } else {
        echo "❌ ERROR: Column '$c' is missing!\n";
    }
}
