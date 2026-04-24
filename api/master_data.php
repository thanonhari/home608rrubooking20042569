<?php
// api/master_data.php
require_once __DIR__ . '/base.php';

// NO requireLogin() here so register modal can use it
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $depts = $pdo->query("SELECT id, name FROM departments ORDER BY name ASC")->fetchAll();
    $positions = $pdo->query("SELECT id, name FROM positions ORDER BY name ASC")->fetchAll();
    
    sendResponse([
        'departments' => $depts,
        'positions' => $positions
    ]);
}

// Admin only for modifications
requireRole('admin');
$input = getInput();

if ($method === 'POST') {
    $type = $input['type'] ?? ''; // 'dept' or 'pos'
    $name = trim($input['name'] ?? '');

    if (empty($name)) sendResponse(['error' => 'Name required'], 400);

    if ($type === 'dept') {
        $stmt = $pdo->prepare("INSERT IGNORE INTO departments (name) VALUES (?)");
    } else {
        $stmt = $pdo->prepare("INSERT IGNORE INTO positions (name) VALUES (?)");
    }
    
    $stmt->execute([$name]);
    logAction('MASTER_DATA_ADDED', "Added $type: $name");
    sendResponse(['success' => true]);
}

if ($method === 'DELETE') {
    $type = $_GET['type'] ?? '';
    $id = $_GET['id'] ?? '';

    if (!$id) sendResponse(['error' => 'ID required'], 400);

    if ($type === 'dept') {
        $stmt = $pdo->prepare("DELETE FROM departments WHERE id = ?");
    } else {
        $stmt = $pdo->prepare("DELETE FROM positions WHERE id = ?");
    }
    
    $stmt->execute([$id]);
    logAction('MASTER_DATA_DELETED', "Removed $type ID: $id");
    sendResponse(['success' => true]);
}
