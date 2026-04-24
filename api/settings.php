<?php
// api/settings.php
require_once __DIR__ . '/base.php';

requireRole('admin');

$method = $_SERVER['REQUEST_METHOD'];
$input = getInput();

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
    $settings = [];
    foreach ($stmt->fetchAll() as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    sendResponse($settings);
}

if ($method === 'POST') {
    foreach ($input as $key => $value) {
        $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        $stmt->execute([$key, $value, $value]);
    }
    sendResponse(['success' => true]);
}

sendResponse(['error' => 'Method not allowed'], 405);
