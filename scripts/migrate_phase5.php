<?php
require_once __DIR__ . '/../includes/db.php';
try {
    $pdo->exec("ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS check_in_time DATETIME AFTER status,
        ADD COLUMN IF NOT EXISTS check_out_time DATETIME AFTER check_in_time,
        ADD COLUMN IF NOT EXISTS rating INT AFTER check_out_time,
        ADD COLUMN IF NOT EXISTS feedback TEXT AFTER rating
    ");
    echo "Bookings table updated with check-in/rating columns.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
