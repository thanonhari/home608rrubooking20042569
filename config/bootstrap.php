<?php

use Dotenv\Dotenv;
use Whoops\Run;
use Whoops\Handler\PrettyPageHandler;

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
if (file_exists(__DIR__ . '/../.env')) {
    $dotenv->load();
}

// Error handling
if ($_ENV['APP_DEBUG'] === 'true') {
    $whoops = new Run;
    $whoops->pushHandler(new PrettyPageHandler);
    $whoops->register();
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Timezone
date_default_timezone_set($_ENV['APP_TIMEZONE'] ?? 'UTC');

// Return a simple container or app state
return [
    'env' => $_ENV['APP_ENV'] ?? 'production',
    'debug' => $_ENV['APP_DEBUG'] === 'true',
];
