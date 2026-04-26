<?php
// scripts/debug_profile_api.php
error_reporting(E_ALL);
ini_set('display_errors', 0); // Keep clean JSON

// 1. Load DB
require_once __DIR__ . '/../includes/db.php';

// 2. Mock functions that base.php provides
function sendResponse($data, $code = 200) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Logic from api/profile.php
$userId = 11; // External User
try {
    $depts = $pdo->query("SELECT name FROM departments ORDER BY name ASC")->fetchAll(PDO::FETCH_COLUMN);
    $positions = $pdo->query("SELECT name FROM positions ORDER BY name ASC")->fetchAll(PDO::FETCH_COLUMN);
    
    $stmt = $pdo->prepare("SELECT id, username, prefix, fullname, role, user_type, status, position, department, organization, address, line_id, phone, email, created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $userProfile = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'profile' => $userProfile, 
        'master' => ['departments' => $depts, 'positions' => $positions]
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
