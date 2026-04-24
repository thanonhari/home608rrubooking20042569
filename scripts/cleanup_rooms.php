<?php
// cleanup_rooms.php - ล้างข้อมูลห้องที่ซ้ำและล็อกไม่ให้ซ้ำอีก
require_once 'includes/db.php';

try {
    echo "<h2>Cleaning up duplicate rooms...</h2>";

    // 1. ลบรายการที่ซ้ำโดยเก็บ ID ที่น้อยที่สุดไว้
    $pdo->exec("
        DELETE r1 FROM rooms r1
        INNER JOIN rooms r2 
        WHERE r1.id > r2.id AND r1.name = r2.name
    ");
    echo "- Duplicate rooms removed successfully.<br>";

    // 2. เพิ่ม UNIQUE Constraint เพื่อป้องกันการเกิดเหตุการณ์นี้อีกในอนาคต
    try {
        $pdo->exec("ALTER TABLE rooms ADD UNIQUE (name)");
        echo "- Added UNIQUE constraint to room names.<br>";
    } catch (Exception $e) {
        echo "- UNIQUE constraint already exists or could not be added.<br>";
    }

    echo "<h3>✅ CLEANUP COMPLETE!</h3>";
    echo "<a href='index.php'>กลับหน้าหลัก</a>";

} catch (Exception $e) {
    echo "<br><b style='color:red;'>Cleanup Failed:</b> " . $e->getMessage();
}
?>
