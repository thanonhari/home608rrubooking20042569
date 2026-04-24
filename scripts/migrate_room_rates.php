<?php
// scripts/migrate_room_rates.php
require_once __DIR__ . '/../includes/db.php';

echo "Starting migration: Adding room rate columns...\n";

try {
    $stmt = $pdo->query("DESCRIBE rooms");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $updates = [];
    if (!in_array('rate_4h', $columns)) $updates[] = "ADD COLUMN rate_4h DECIMAL(10,2) DEFAULT 0.00";
    if (!in_array('rate_8h', $columns)) $updates[] = "ADD COLUMN rate_8h DECIMAL(10,2) DEFAULT 0.00";
    if (!in_array('extra_electricity_per_h', $columns)) $updates[] = "ADD COLUMN extra_electricity_per_h DECIMAL(10,2) DEFAULT 0.00";
    if (!in_array('extra_staff_per_h', $columns)) $updates[] = "ADD COLUMN extra_staff_per_h DECIMAL(10,2) DEFAULT 0.00";

    if (!empty($updates)) {
        $pdo->exec("ALTER TABLE rooms " . implode(", ", $updates));
        echo "Database schema updated successfully.\n";
    } else {
        echo "Columns already exist.\n";
    }

    // Step 2: Update Room Data from the provided images
    $roomUpdates = [
        ['ห้องโโชคนันท์', 14000, 21500, 1500, 400],
        ['ห้องเขียวมรกต', 1500, 2000, 1000, 200],
        ['ห้องทองเจ้าพัฒน์', 7200, 10200, 1000, 200],
        ['ห้องเทพนิมิตร', 1500, 2000, 1000, 200],
        ['ห้องมหาชนก', 7200, 10200, 1000, 200],
        ['ห้องขุนทิพย์', 7200, 10200, 1000, 200],
        ['ห้องเจ้าเสวย', 10200, 16200, 1000, 200],
        ['ห้องทูลถวาย', 7200, 10200, 1000, 200],
        ['ห้องนวลจันทร์', 7200, 10200, 1000, 200],
        ['ห้องศรีสยาม', 10700, 17200, 1000, 300],
        ['ห้องประชุมราชนครินทร์ ชั้น 5', 39000, 49000, 2500, 800],
        ['ห้องหงษ์ทอง', 7200, 10200, 1000, 200],
        ['ห้องเจ้าพระยา', 11700, 18700, 1500, 300],
        ['ห้องการะเกด', 11700, 18700, 1500, 300],
        ['ห้องสเตจ', 10200, 16200, 1000, 200],
        ['ห้องคอมพิวเตอร์', 10200, 16200, 1000, 200]
    ];

    $stmt = $pdo->prepare("UPDATE rooms SET rate_4h = ?, rate_8h = ?, extra_electricity_per_h = ?, extra_staff_per_h = ? WHERE name LIKE ?");
    foreach ($roomUpdates as $r) {
        $stmt->execute([$r[1], $r[2], $r[3], $r[4], '%' . $r[0] . '%']);
    }

    echo "Room rates updated successfully based on the official documents.\n";

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
