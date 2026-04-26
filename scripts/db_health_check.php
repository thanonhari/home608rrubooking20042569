<?php
// scripts/db_health_check.php
require_once __DIR__ . '/../includes/db.php';

function checkTable($pdo, $table, $expectedCols) {
    echo "Checking table: $table... ";
    try {
        $stmt = $pdo->query("DESCRIBE $table");
        $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $missing = array_diff($expectedCols, $cols);
        if (empty($missing)) {
            echo "[OK]\n";
        } else {
            echo "[MISSING] " . implode(', ', $missing) . "\n";
        }
    } catch (Exception $e) {
        echo "[ERROR] " . $e->getMessage() . "\n";
    }
}

checkTable($pdo, 'users', ['id', 'username', 'password_hash', 'role', 'status', 'email', 'user_type', 'organization']);
checkTable($pdo, 'bookings', ['id', 'room_id', 'user_id', 'title', 'status', 'total_amount', 'deposit_amount', 'check_in_time', 'check_out_time']);
checkTable($pdo, 'rooms', ['id', 'name', 'rate_4h', 'rate_8h', 'extra_electricity_per_h', 'extra_staff_per_h']);
checkTable($pdo, 'settings', ['setting_key', 'setting_value']);
checkTable($pdo, 'room_photos', ['id', 'room_id', 'file_path']);
checkTable($pdo, 'audit_logs', ['id', 'user_id', 'action', 'details']);
