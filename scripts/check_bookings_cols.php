<?php
require_once 'includes/db.php';
$stmt = $pdo->query("DESCRIBE bookings");
print_r($stmt->fetchAll());
