<?php
require_once __DIR__ . '/../includes/db.php';
try {
    $tables = ['users', 'rooms', 'bookings', 'room_photos', 'audit_logs', 'settings', 'departments', 'positions'];
    foreach ($tables as $t) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$t'");
        if ($stmt->rowCount() == 0) {
            echo "MISSING TABLE: $t\n";
            if ($t === 'audit_logs') {
                $pdo->exec("CREATE TABLE audit_logs (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, action VARCHAR(50), details TEXT, ip_address VARCHAR(45), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
                echo "-> Created audit_logs\n";
            }
        } else {
            echo "Table $t exists.\n";
        }
    }
    
    // Final check for rooms.php specific fields
    $stmt = $pdo->query("DESCRIBE rooms");
    $cols = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'Field');
    if (!in_array('photo_url', $cols)) {
        $pdo->exec("ALTER TABLE rooms ADD COLUMN photo_url VARCHAR(255) AFTER description");
        echo "Added photo_url to rooms table.\n";
    }
    
    echo "Verification complete.\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
