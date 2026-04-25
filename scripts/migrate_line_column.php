<?php
require_once __DIR__ . '/../includes/db.php';

try {
    $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(100) DEFAULT NULL AFTER email");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_line_user_id ON users(line_user_id)");
    echo "Successfully added line_user_id column to users table.\n";
} catch (PDOException $e) {
    echo "Error updating database: " . $e->getMessage() . "\n";
}
