<?php
require_once 'includes/db.php';

try {
    // Create settings table
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Initialize default settings
    $pdo->exec("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
        ('telegram_bot_token', ''),
        ('telegram_chat_id', '')");

    echo "Settings table verified and initialized.\n";
} catch (Exception $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
}
?>
