<?php
// api/admin_tools.php
require_once __DIR__ . '/base.php';

requireRole('admin');

$action = $_GET['action'] ?? '';

if ($action === 'backup') {
    try {
        // Run the backup script
        $scriptPath = realpath(__DIR__ . '/../scripts/backup_db.php');
        $phpPath = 'C:\xampp\php\php.exe';
        
        $command = "\"$phpPath\" \"$scriptPath\" 2>&1";
        $output = shell_exec($command);
        
        logAction('MANUAL_BACKUP_CREATED', "Backup triggered from Admin UI");
        
        sendResponse([
            'success' => true,
            'message' => 'Backup process completed',
            'output' => $output
        ]);
    } catch (Exception $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

if ($action === 'list_backups') {
    try {
        $backupDir = __DIR__ . '/../backups';
        if (!is_dir($backupDir)) mkdir($backupDir, 0777, true);
        
        $files = glob($backupDir . '/*.sql');
        $backups = [];
        
        foreach ($files as $file) {
            $backups[] = [
                'filename' => basename($file),
                'size' => round(filesize($file) / 1024, 2) . ' KB',
                'date' => date('Y-m-d H:i:s', filemtime($file))
            ];
        }
        
        // Sort by date desc
        usort($backups, function($a, $b) {
            return strcmp($b['date'], $a['date']);
        });
        
        sendResponse(array_slice($backups, 0, 10)); // Top 10
    } catch (Exception $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

sendResponse(['error' => 'Invalid tool action'], 400);
