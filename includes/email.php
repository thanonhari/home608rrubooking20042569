<?php
// includes/email.php

/**
 * Send an email notification using system settings
 */
function sendEmailNotification($to, $subject, $message) {
    global $pdo;

    // Fetch settings
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'smtp_%'");
    $settings = [];
    foreach ($stmt->fetchAll() as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    if (empty($settings['smtp_user']) || empty($to)) {
        return false;
    }

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=utf-8',
        'From: ' . ($settings['smtp_from'] ?: $settings['smtp_user']),
        'Reply-To: ' . ($settings['smtp_from'] ?: $settings['smtp_user']),
        'X-Mailer: PHP/' . phpversion()
    ];

    // In a real production environment with XAMPP, mail() needs sendmail setup.
    // For YOLO mode, we provide the infrastructure. If the server is configured, it works.
    // Ideally, PHPMailer should be used for direct SMTP, but we avoid adding heavy dependencies now.
    
    $fullMessage = "
    <html>
    <head>
        <title>$subject</title>
        <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto; }
            .header { background: #4f46e5; color: white; padding: 15px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { padding: 20px; }
            .footer { font-size: 12px; color: #999; margin-top: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'><h2>Room Booking System</h2></div>
            <div class='content'>$message</div>
            <div class='footer'>This is an automated message from RRU Room Booking System.</div>
        </div>
    </body>
    </html>
    ";

    return @mail($to, $subject, $fullMessage, implode("\r\n", $headers));
}
?>
