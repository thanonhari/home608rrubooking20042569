<?php
require_once __DIR__ . '/../includes/db.php';
$s = $pdo->query("SHOW CREATE TABLE users")->fetch(PDO::FETCH_ASSOC);
echo $s['Create Table'];
