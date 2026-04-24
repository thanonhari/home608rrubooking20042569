<?php
// api/migrate_v7.php - YOLO Phase 7 (Check-in & Rating)
require_once __DIR__ . '/base.php';

requireRole('admin');

header('Content-Type: text/plain; charset=utf-8');

try {
    echo "Starting Migration Phase 7...\n";

    // 1. Add Check-in / Check-out / Rating columns to bookings
    $pdo->exec("ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS check_in_time DATETIME NULL AFTER status,
        ADD COLUMN IF NOT EXISTS check_out_time DATETIME NULL AFTER check_in_time,
        ADD COLUMN IF NOT EXISTS rating INT DEFAULT NULL AFTER check_out_time,
        ADD COLUMN IF NOT EXISTS feedback TEXT NULL AFTER rating
    ");
    echo "- Check-in and Rating columns added to 'bookings'.\n";

    echo "\n>>> Migration Phase 7 successful! <<<";

} catch (Exception $e) {
    echo "\nError during migration: " . $e->getMessage();
}
?>
