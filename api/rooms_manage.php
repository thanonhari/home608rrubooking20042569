<?php
// api/rooms_manage.php
require_once __DIR__ . '/base.php';

requireRole('admin');

$method = $_SERVER['REQUEST_METHOD'];
$input = getInput();

if ($method === 'POST') {
    try {
        $name = $input['name'] ?? '';
        $desc = $input['description'] ?? '';
        $photo = $input['photo_url'] ?? '';
        $cap = $input['capacity'] ?? 0;
        $equip = $input['equipment'] ?? '';

        if (empty($name)) sendResponse(['error' => 'Name is required'], 400);

        if (isset($input['id'])) {
            $stmt = $pdo->prepare("UPDATE rooms SET name = ?, description = ?, photo_url = ?, capacity = ?, equipment = ? WHERE id = ?");
            $stmt->execute([$name, $desc, $photo, $cap, $equip, $input['id']]);
            logAction('ROOM_UPDATED', "Updated room: $name");
        } else {
            $stmt = $pdo->prepare("INSERT INTO rooms (name, description, photo_url, capacity, equipment) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $desc, $photo, $cap, $equip]);
            logAction('ROOM_CREATED', "Created room: $name");
        }
        sendResponse(['success' => true]);
    } catch (Exception $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

if ($method === 'DELETE') {
    try {
        $id = $_GET['id'] ?? null;
        $action = $_GET['action'] ?? '';

        if ($action === 'delete_photo') {
            $stmt = $pdo->prepare("SELECT file_path FROM room_photos WHERE id = ?");
            $stmt->execute([$id]);
            $photo = $stmt->fetchColumn();
            if ($photo && file_exists(__DIR__ . '/../' . $photo)) {
                unlink(__DIR__ . '/../' . $photo);
            }
            $stmt = $pdo->prepare("DELETE FROM room_photos WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(['success' => true]);
        }

        if (!$id) sendResponse(['error' => 'ID required'], 400);

        $stmt = $pdo->prepare("DELETE FROM rooms WHERE id = ?");
        $stmt->execute([$id]);
        logAction('ROOM_DELETED', "Room ID $id removed");
        sendResponse(['success' => true]);
    } catch (Exception $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

sendResponse(['error' => 'Method not allowed'], 405);
