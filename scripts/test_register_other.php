<?php
require_once 'includes/db.php';

$input = [
    'username' => 'test_other_user',
    'password' => 'pass123',
    'prefix' => 'นาย',
    'fullname' => 'Test Other',
    'position' => 'ตำแหน่งใหม่เอี่ยม',
    'department' => 'สังกัดใหม่เอี่ยม',
    'phone' => '0999999999'
];

$username = $input['username'];
$password = $input['password'];
$prefix = $input['prefix'];
$fullname = $input['fullname'];
$position = $input['position'];
$department = $input['department'];
$phone = $input['phone'];

$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (username, prefix, fullname, password_hash, role, status, position, department, phone) VALUES (?, ?, ?, ?, 'user', 'pending', ?, ?, ?)");
    $stmt->execute([$username, $prefix, $fullname, $hash, $position, $department, $phone]);
    
    echo "User created successfully.\n";
    
    // Verify
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    echo "Verifying data in DB:\n";
    print_r($user);
    
    // Cleanup
    $pdo->prepare("DELETE FROM users WHERE username = ?")->execute([$username]);

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
