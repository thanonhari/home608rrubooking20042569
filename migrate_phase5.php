<?php
require_once 'includes/db.php';

try {
    // 1. Add equipment to rooms if not exists
    $pdo->exec("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS equipment TEXT AFTER description");
    
    // 2. Create audit_logs table
    $pdo->exec("CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    echo "Migration Phase 5 (Step 1-2) successful.";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage();
}
?>
