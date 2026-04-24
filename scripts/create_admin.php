<?php
require_once 'includes/db.php';

$username = 'admin';
$password = 'admin123';
$role = 'admin';
$status = 'active';

try {
    $hash = password_hash($password, PASSWORD_BCRYPT);
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user) {
        // Update existing admin
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ?, role = ?, status = ? WHERE id = ?");
        $stmt->execute([$hash, $role, $status, $user['id']]);
        echo "Admin user updated successfully.\n";
    } else {
        // Insert new admin
        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, role, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([$username, $hash, $role, $status]);
        echo "Admin user created successfully.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
