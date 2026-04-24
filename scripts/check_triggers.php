<?php
require_once 'includes/db.php';
$stmt = $pdo->query("SHOW TRIGGERS");
print_r($stmt->fetchAll());
?>
