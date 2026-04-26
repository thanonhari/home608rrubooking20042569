<?php
// scripts/migrate_add_email.php
require_once __DIR__ . '/../includes/db.php';

try {
    $pdo->exec("ALTER TABLE users ADD COLUMN email VARCHAR(100) AFTER phone");
    echo "SUCCESS: Added email column to users table.\n";
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "INFO: email column already exists.\n";
    } else {
        echo "ERROR: " . $e->getMessage() . "\n";
    }
}

try {
    // Also check for user_type and organization which were mentioned in GEMINI.md but might be missing
    $pdo->exec("ALTER TABLE users ADD COLUMN user_type ENUM('internal', 'external') DEFAULT 'internal' AFTER role");
    echo "SUCCESS: Added user_type column to users table.\n";
} catch (Exception $e) {}

try {
    $pdo->exec("ALTER TABLE users ADD COLUMN organization VARCHAR(255) AFTER department");
    echo "SUCCESS: Added organization column to users table.\n";
} catch (Exception $e) {}
