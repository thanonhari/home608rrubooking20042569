<?php
require_once 'includes/db.php';
try {
    $pdo->exec("ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS position VARCHAR(100), 
        ADD COLUMN IF NOT EXISTS department VARCHAR(255), 
        ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
    echo "SUCCESS: User profile columns added.\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
