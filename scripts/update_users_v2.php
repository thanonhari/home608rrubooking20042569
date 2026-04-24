<?php
require_once 'includes/db.php';
try {
    $pdo->exec("ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS prefix VARCHAR(20) AFTER username,
        ADD COLUMN IF NOT EXISTS fullname VARCHAR(255) AFTER prefix");
    echo "SUCCESS: Prefix and Fullname columns added.\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
