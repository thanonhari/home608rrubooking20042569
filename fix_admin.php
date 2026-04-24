<?php
require_once 'includes/db.php';
$password = 'admin123';
$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE username = 'admin'");
$stmt->execute([$hash]);
echo "Admin password has been reset to: admin123";
// unlink(__FILE__); // ลบไฟล์นี้ทิ้งหลังรันเสร็จเพื่อความปลอดภัย
?>
