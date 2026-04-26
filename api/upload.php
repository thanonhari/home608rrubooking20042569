<?php
// api/upload.php
require_once __DIR__ . '/base.php';

requireRole(['admin', 'approver', 'staff']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

if (!isset($_FILES['photo'])) {
    sendResponse(['error' => 'No file uploaded'], 400);
}

$file = $_FILES['photo'];
$roomId = $_POST['room_id'] ?? null;

if (!$roomId) {
    sendResponse(['error' => 'Room ID required'], 400);
}

// Security: Validate file type and actual content
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    sendResponse(['error' => 'Invalid image content. Only JPG, PNG, WEBP allowed.'], 400);
}

// Additional check: getimagesize
$check = getimagesize($file['tmp_name']);
if ($check === false) {
    sendResponse(['error' => 'File is not a valid image.'], 400);
}

// Security: Limit size (5MB)
if ($file['size'] > 5 * 1024 * 1024) {
    sendResponse(['error' => 'File too large (Max 5MB)'], 400);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$fileName = 'room_' . $roomId . '_' . time() . '_' . uniqid() . '.' . $ext;
$targetPath = __DIR__ . '/../uploads/rooms/' . $fileName;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Save to DB
    $stmt = $pdo->prepare("INSERT INTO room_photos (room_id, file_path) VALUES (?, ?)");
    $stmt->execute([$roomId, 'uploads/rooms/' . $fileName]);
    
    logAction('PHOTO_UPLOADED', "Uploaded photo for Room ID: $roomId ($fileName)");
    
    sendResponse([
        'success' => true,
        'photo' => [
            'id' => $pdo->lastInsertId(),
            'path' => 'uploads/rooms/' . $fileName
        ]
    ]);
} else {
    sendResponse(['error' => 'Failed to save file'], 500);
}
