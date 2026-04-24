<?php
// api/rooms.php
require_once __DIR__ . '/base.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

if ($method === 'GET') {
    try {
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
            $stmt->execute([$id]);
            $room = $stmt->fetch();
            if ($room) {
                $stmt = $pdo->prepare("SELECT id, file_path, is_main FROM room_photos WHERE room_id = ? ORDER BY is_main DESC, created_at ASC");
                $stmt->execute([$id]);
                $room['photos'] = $stmt->fetchAll();
            }
            sendResponse($room);
        } else {
            $stmt = $pdo->query("SELECT * FROM rooms ORDER BY name ASC");
            $rooms = $stmt->fetchAll();
            
            // Optionally attach main photo to each room
            foreach ($rooms as &$r) {
                $stmt = $pdo->prepare("SELECT file_path FROM room_photos WHERE room_id = ? AND is_main = 1 LIMIT 1");
                $stmt->execute([$r['id']]);
                $main = $stmt->fetchColumn();
                if (!$main) {
                    $stmt = $pdo->prepare("SELECT file_path FROM room_photos WHERE room_id = ? ORDER BY created_at ASC LIMIT 1");
                    $stmt->execute([$r['id']]);
                    $main = $stmt->fetchColumn();
                }
                $r['main_photo'] = $main ?: $r['photo_url']; // Fallback to old URL if no uploaded photo
            }
            sendResponse($rooms);
        }
    } catch (Exception $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

sendResponse(['error' => 'Method not allowed'], 405);
