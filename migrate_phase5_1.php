<?php
require_once 'includes/db.php';

try {
    // Add status column to users table
    $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active', 'pending', 'suspended') DEFAULT 'pending' AFTER role");
    
    // Set existing admin to active
    $pdo->exec("UPDATE users SET status = 'active' WHERE username = 'admin'");

    echo "Migration Phase 5.1 (User Status) successful.";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage();
}
?>
