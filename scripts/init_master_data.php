<?php
require_once 'includes/db.php';
try {
    // Create departments table
    $pdo->exec("CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Create positions table
    $pdo->exec("CREATE TABLE IF NOT EXISTS positions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Insert Default Departments (RRU Style)
    $depts = [
        'คณะครุศาสตร์', 'คณะมนุษยศาสตร์และสังคมศาสตร์', 'คณะวิทยาศาสตร์และเทคโนโลยี', 
        'คณะวิทยาการจัดการ', 'คณะพยาบาลศาสตร์', 'สำนักงานอธิการบดี', 'สำนักวิทยบริการและเทคโนโลยีสารสนเทศ',
        'สำนักทะเบียนและประมวลผล', 'ศูนย์ภาษา', 'ศูนย์ฝึกประสบการณ์วิชาชีพ'
    ];
    $stmt = $pdo->prepare("INSERT IGNORE INTO departments (name) VALUES (?)");
    foreach ($depts as $d) $stmt->execute([$d]);

    // Insert Default Positions
    $positions = ['อาจารย์', 'หัวหน้าภาควิชา', 'คณบดี', 'เจ้าหน้าที่บริหารงานทั่วไป', 'นักวิชาการคอมพิวเตอร์', 'บุคคลภายนอก'];
    $stmt = $pdo->prepare("INSERT IGNORE INTO positions (name) VALUES (?)");
    foreach ($positions as $p) $stmt->execute([$p]);

    echo "SUCCESS: Master data tables and initial values created.\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
