<?php
// scripts/migrate_external_booking_v2.php
require_once __DIR__ . '/../includes/db.php';

echo "Starting migration: Adding external booking enhancement columns...\n";

try {
    $stmt = $pdo->query("DESCRIBE bookings");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $updates = [];
    
    if (!in_array('purpose_type', $columns)) {
        $updates[] = "ADD COLUMN purpose_type ENUM('meeting', 'wedding', 'banquet', 'other') DEFAULT 'meeting' AFTER title";
    }
    if (!in_array('address', $columns)) {
        $updates[] = "ADD COLUMN address TEXT NULL AFTER phone";
    }
    if (!in_array('line_id', $columns)) {
        $updates[] = "ADD COLUMN line_id VARCHAR(50) NULL AFTER address";
    }
    if (!in_array('total_amount', $columns)) {
        $updates[] = "ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0.00 AFTER status";
    }
    if (!in_array('deposit_amount', $columns)) {
        $updates[] = "ADD COLUMN deposit_amount DECIMAL(10,2) DEFAULT 0.00 AFTER total_amount";
    }
    if (!in_array('payment_status', $columns)) {
        $updates[] = "ADD COLUMN payment_status ENUM('pending', 'partial', 'paid') DEFAULT 'pending' AFTER deposit_amount";
    }
    if (!in_array('attachment_path', $columns)) {
        $updates[] = "ADD COLUMN attachment_path VARCHAR(255) NULL AFTER end_time";
    }

    if (empty($updates)) {
        echo "Columns already exist.\n";
    } else {
        $sql = "ALTER TABLE bookings " . implode(", ", $updates);
        $pdo->exec($sql);
        echo "Database updated successfully.\n";
    }

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
