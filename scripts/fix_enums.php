<?php
require_once __DIR__ . '/../includes/db.php';
try {
    $pdo->exec("ALTER TABLE users MODIFY COLUMN user_type ENUM('internal', 'external', 'gov') DEFAULT 'internal'");
    $pdo->exec("ALTER TABLE users MODIFY COLUMN status ENUM('active', 'pending', 'inactive', 'suspended') DEFAULT 'pending'");
    echo "DB Updated successfully\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
