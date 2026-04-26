<?php
// scripts/migrate_fix_v2.php
require_once __DIR__ . '/../includes/db.php';

function execSafe($pdo, $sql, $desc) {
    try {
        $pdo->exec($sql);
        echo "[SUCCESS] $desc\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate') !== false || strpos($e->getMessage(), 'already exists') !== false) {
            echo "[INFO] $desc (Already exists)\n";
        } else {
            echo "[ERROR] $desc: " . $e->getMessage() . "\n";
        }
    }
}

// 1. Fix room_photos
execSafe($pdo, "ALTER TABLE room_photos ADD COLUMN is_main TINYINT(1) DEFAULT 0 AFTER file_path", "Add is_main to room_photos");

// 2. Fix users
execSafe($pdo, "ALTER TABLE users ADD COLUMN line_user_id VARCHAR(255) AFTER email", "Add line_user_id to users");

// 3. Fix bookings (ensure start_time, end_time exist as stats.php uses them)
execSafe($pdo, "ALTER TABLE bookings ADD COLUMN start_time DATETIME AFTER status", "Add start_time to bookings");
execSafe($pdo, "ALTER TABLE bookings ADD COLUMN end_time DATETIME AFTER start_time", "Add end_time to bookings");

echo "Migration v2 complete.\n";
