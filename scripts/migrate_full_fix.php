<?php
// scripts/migrate_full_fix.php
require_once __DIR__ . '/../includes/db.php';

echo "--- Starting Full Database Migration ---\n";

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

// 1. Fix Bookings Table
execSafe($pdo, "ALTER TABLE bookings ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0.00 AFTER status", "Add total_amount to bookings");
execSafe($pdo, "ALTER TABLE bookings ADD COLUMN deposit_amount DECIMAL(10,2) DEFAULT 0.00 AFTER total_amount", "Add deposit_amount to bookings");
execSafe($pdo, "ALTER TABLE bookings ADD COLUMN payment_status ENUM('pending', 'partial', 'paid') DEFAULT 'pending' AFTER deposit_amount", "Add payment_status to bookings");
execSafe($pdo, "ALTER TABLE bookings ADD COLUMN check_in_time DATETIME AFTER payment_status", "Add check_in_time to bookings");
execSafe($pdo, "ALTER TABLE bookings ADD COLUMN check_out_time DATETIME AFTER check_in_time", "Add check_out_time to bookings");
execSafe($pdo, "ALTER TABLE bookings ADD COLUMN rating INT AFTER check_out_time", "Add rating to bookings");

// 2. Fix Rooms Table
execSafe($pdo, "ALTER TABLE rooms ADD COLUMN rate_4h DECIMAL(10,2) DEFAULT 0.00 AFTER capacity", "Add rate_4h to rooms");
execSafe($pdo, "ALTER TABLE rooms ADD COLUMN rate_8h DECIMAL(10,2) DEFAULT 0.00 AFTER rate_4h", "Add rate_8h to rooms");
execSafe($pdo, "ALTER TABLE rooms ADD COLUMN extra_electricity_per_h DECIMAL(10,2) DEFAULT 0.00 AFTER rate_8h", "Add extra_electricity_per_h to rooms");
execSafe($pdo, "ALTER TABLE rooms ADD COLUMN extra_staff_per_h DECIMAL(10,2) DEFAULT 0.00 AFTER extra_electricity_per_h", "Add extra_staff_per_h to rooms");
execSafe($pdo, "ALTER TABLE rooms ADD COLUMN main_photo VARCHAR(255) AFTER extra_staff_per_h", "Add main_photo to rooms");

// 3. Create Room Photos Table
execSafe($pdo, "
    CREATE TABLE IF NOT EXISTS room_photos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
", "Create room_photos table");

echo "--- Migration Completed ---\n";
