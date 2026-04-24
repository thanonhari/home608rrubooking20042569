<?php
require_once __DIR__ . '/../includes/db.php';
$stmt = $pdo->query("DESCRIBE bookings");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
