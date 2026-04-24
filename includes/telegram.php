<?php
// includes/telegram.php

/**
 * Send a notification to Telegram
 */
function sendTelegramNotification($message) {
    global $pdo;

    $stmt = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
    
    $stmt->execute(['telegram_bot_token']);
    $token = $stmt->fetchColumn();
    
    $stmt->execute(['telegram_chat_id']);
    $chatId = $stmt->fetchColumn();

    if (empty($token) || empty($chatId)) {
        return false;
    }

    $url = "https://api.telegram.org/bot$token/sendMessage";
    $data = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];

    $options = [
        'http' => [
            'method'  => 'POST',
            'header'  => 'Content-type: application/x-www-form-urlencoded',
            'content' => http_build_query($data),
            'ignore_errors' => true
        ]
    ];

    $context  = stream_context_create($options);
    $result = @file_get_contents($url, false, $context);
    
    return $result !== false;
}
