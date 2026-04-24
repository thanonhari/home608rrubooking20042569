<?php
require_once 'includes/db.php';
try {
    $pdo->exec("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
        ('smtp_host', 'smtp.gmail.com'),
        ('smtp_port', '587'),
        ('smtp_user', ''),
        ('smtp_pass', ''),
        ('smtp_from', 'noreply@rru.ac.th'),
        ('email_notify_admin', '1'),
        ('email_notify_user', '1')
    ");
    echo 'Email settings initialized.';
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
?>
