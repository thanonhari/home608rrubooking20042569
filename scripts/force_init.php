<?php
// scripts/force_init.php
$p = new PDO('mysql:host=localhost:3306;charset=utf8mb4', 'root', '');
$p->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "Creating database...\n";
$p->exec("CREATE DATABASE IF NOT EXISTS room_booking");
$p->exec("USE room_booking");

echo "Creating settings table...\n";
$p->exec("CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

echo "Inserting defaults...\n";
$p->exec("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('telegram_bot_token', ''), ('telegram_chat_id', '')");

echo "SUCCESS: Database and table are ready.\n";
?>
