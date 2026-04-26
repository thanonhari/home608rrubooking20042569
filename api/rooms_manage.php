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
        $r4 = $input['rate_4h'] ?? 0;
        $r8 = $input['rate_8h'] ?? 0;
        $ee = $input['extra_electricity_per_h'] ?? 0;
        $es = $input['extra_staff_per_h'] ?? 0;

        if (empty($name)) sendResponse(['error' => 'Name is required'], 400);

        if (isset($input['id'])) {
            $stmt = $pdo->prepare("UPDATE rooms SET name = ?, description = ?, photo_url = ?, capacity = ?, equipment = ?, rate_4h = ?, rate_8h = ?, extra_electricity_per_h = ?, extra_staff_per_h = ? WHERE id = ?");
            $stmt->execute([$name, $desc, $photo, $cap, $equip, $r4, $r8, $ee, $es, $input['id']]);
            logAction('ROOM_UPDATED', "Updated room: $name (ID: {$input['id']})");
        } else {
            $stmt = $pdo->prepare("INSERT INTO rooms (name, description, photo_url, capacity, equipment, rate_4h, rate_8h, extra_electricity_per_h, extra_staff_per_h) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $desc, $photo, $cap, $equip, $r4, $r8, $ee, $es]);
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
            logAction('PHOTO_DELETED', "Deleted room photo ID: $id");
            sendResponse(['success' => true]);
        }

        if (!$id) sendResponse(['error' => 'ID required'], 400);

        // Delete associated photos from disk first
        $stmt = $pdo->prepare("SELECT file_path FROM room_photos WHERE room_id = ?");
        $stmt->execute([$id]);
        $photos = $stmt->fetchAll(PDO::FETCH_COLUMN);
        foreach ($photos as $p) {
            if ($p && file_exists(__DIR__ . '/../' . $p)) unlink(__DIR__ . '/../' . $p);
        }
        $pdo->prepare("DELETE FROM room_photos WHERE room_id = ?")->execute([$id]);

        $stmt = $pdo->prepare("DELETE FROM rooms WHERE id = ?");
        $stmt->execute([$id]);
        logAction('ROOM_DELETED', "Room ID $id removed (with " . count($photos) . " photos)");
        sendResponse(['success' => true]);
    } catch (Exception $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

sendResponse(['error' => 'Method not allowed'], 405);
