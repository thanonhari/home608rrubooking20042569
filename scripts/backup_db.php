<?php
/**
 * Automated Database Backup Script
 * Principle: Simplicity First & Goal-Driven Execution
 */

// Load DB config manually to avoid dependency issues in CLI
$host = '127.0.0.1';
$db   = 'room_booking';
$user = 'root';
$pass = '';

$backupDir = __DIR__ . '/../backups';
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0777, true);
}

$date = date('Y-m-d_H-i-s');
$filename = "backup_{$db}_{$date}.sql";
$filePath = "{$backupDir}/{$filename}";

// XAMPP usually has mysqldump in its bin folder
$mysqldump = 'C:\xampp\mysql\bin\mysqldump.exe'; 

echo "Starting backup for database: {$db}...\n";

$command = sprintf(
    '%s --user=%s --password=%s --host=%s %s > %s',
    escapeshellarg($mysqldump),
    escapeshellarg($user),
    escapeshellarg($pass),
    escapeshellarg($host),
    escapeshellarg($db),
    escapeshellarg($filePath)
);

// Execute the command
exec($command, $output, $returnVar);

if ($returnVar === 0) {
    echo "Backup successful: {$filePath}\n";
    
    // Cleanup: Remove backups older than 30 days
    $files = glob($backupDir . '/*.sql');
    $now = time();
    $days30 = 30 * 24 * 60 * 60;
    
    foreach ($files as $file) {
        if (is_file($file) && ($now - filemtime($file) > $days30)) {
            unlink($file);
            echo "Deleted old backup: " . basename($file) . "\n";
        }
    }
} else {
    echo "Backup failed with exit code: {$returnVar}\n";
    echo "Command attempted: {$command}\n";
}
