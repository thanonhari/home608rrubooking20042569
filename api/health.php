<?php
// api/health.php
require_once __DIR__ . '/base.php';

requireRole('admin');

function get_disk_free_status($path) {
    $free = disk_free_space($path);
    $total = disk_total_space($path);
    $usage = ($total - $free) / $total * 100;
    return [
        'free' => round($free / 1024 / 1024 / 1024, 2) . ' GB',
        'total' => round($total / 1024 / 1024 / 1024, 2) . ' GB',
        'usage_percent' => round($usage, 2) . '%'
    ];
}

$health = [
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'database' => [
        'connection' => 'ok',
        'version' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION)
    ],
    'server' => [
        'php_version' => PHP_VERSION,
        'os' => PHP_OS,
        'disk' => get_disk_free_status(__DIR__)
    ],
    'folders' => [
        'uploads' => [
            'exists' => is_dir(__DIR__ . '/../uploads'),
            'writable' => is_writable(__DIR__ . '/../uploads')
        ],
        'backups' => [
            'exists' => is_dir(__DIR__ . '/../backups'),
            'writable' => is_writable(__DIR__ . '/../backups')
        ]
    ]
];

sendResponse($health);
