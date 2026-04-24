<?php
require_once 'includes/db.php';
try {
    echo "--- Verification Report ---\n";
    
    // 1. Check if user exists
    $stmt = $pdo->prepare("SELECT username, department, position FROM users WHERE username = 'master_data_tester'");
    $stmt->execute();
    echo "User profile in DB: ";
    print_r($stmt->fetch());

    // 2. Check if NEW department was added to master data
    $stmt = $pdo->prepare("SELECT * FROM departments WHERE name = 'ภาควิชา YOLO'");
    $stmt->execute();
    echo "\nDepartment in Master Data: ";
    print_r($stmt->fetch());

    // 3. Check if NEW position was added to master data
    $stmt = $pdo->prepare("SELECT * FROM positions WHERE name = 'ผู้เชี่ยวชาญระดับ Pro Max'");
    $stmt->execute();
    echo "\nPosition in Master Data: ";
    print_r($stmt->fetch());

    // Cleanup for next tests
    $pdo->prepare("DELETE FROM users WHERE username = 'master_data_tester'")->execute();
    echo "\n--- Test Cleanup Done ---";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
