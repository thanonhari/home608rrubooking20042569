<?php
require_once __DIR__ . '/../includes/db.php';
echo "DUPLICATE DEPTS:\n";
print_r($pdo->query("SELECT name, COUNT(*) as count FROM departments GROUP BY name HAVING count > 1")->fetchAll(PDO::FETCH_ASSOC));
echo "\nDUPLICATE POSITIONS:\n";
print_r($pdo->query("SELECT name, COUNT(*) as count FROM positions GROUP BY name HAVING count > 1")->fetchAll(PDO::FETCH_ASSOC));
