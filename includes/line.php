<?php
if (!defined('LINE_ACCESS_TOKEN')) {
    define('LINE_ACCESS_TOKEN', getenv('LINE_CHANNEL_ACCESS_TOKEN') ?: '');
}

/**
 * ส่งข้อความแจ้งเตือนไปยังผู้ใช้ LINE
 * @param string $lineUserId
 * @param string|array $messageOrArray ข้อความธรรมดา หรือ Array รูปแบบ LINE Message
 */
function sendLineNotification($lineUserId, $messageOrArray) {
    if (!$lineUserId || !LINE_ACCESS_TOKEN) return false;

    $url = 'https://api.line.me/v2/bot/message/push';
    
    // ตรวจสอบว่าเป็นข้อความธรรมดาหรือโครงสร้าง LINE
    $message = is_array($messageOrArray) ? $messageOrArray : ['type' => 'text', 'text' => $messageOrArray];

    $payload = [
        'to' => $lineUserId,
        'messages' => [$message]
    ];

    $options = [
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . LINE_ACCESS_TOKEN
            ],
            'content' => json_encode($payload),
            'ignore_errors' => true
        ]
    ];

    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    return $result !== false;
}
