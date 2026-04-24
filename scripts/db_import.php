<?php
// scripts/db_import.php
$host = '127.0.0.1';
$port = '3306'; 
$db   = 'room_booking';
$user = 'root';
$pass = ''; 
$charset = 'utf8mb4';

try {
    // 1. Create DB if not exists
    $dsn = "mysql:host=$host;port=$port;charset=$charset";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => true // Enable multiple statements
    ]);
    
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    echo "Database '$db' verified/created.\n";

    // 2. Import SQL file
    $sql = file_get_contents(__DIR__ . '/../room_booking.sql');
    if ($sql === false) {
        throw new Exception("Could not read room_booking.sql");
    }

    $pdo->exec("USE `$db`;");
    $pdo->exec($sql);
    echo "SQL import successful.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
