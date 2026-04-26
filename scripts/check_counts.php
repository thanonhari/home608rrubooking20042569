<?php
require_once __DIR__ . '/../includes/db.php';
$depts = $pdo->query("SELECT COUNT(*) FROM departments")->fetchColumn();
$pos = $pdo->query("SELECT COUNT(*) FROM positions")->fetchColumn();
echo "Departments: $depts\n";
echo "Positions: $pos\n";
