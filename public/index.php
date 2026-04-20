<?php

/** @var array $app */
$app = require_once __DIR__ . '/../config/bootstrap.php';

header('Content-Type: text/plain');

echo "ThanonRoom Application Initialized\n";
echo "Environment: " . ($app['env'] ?? 'unknown') . "\n";
echo "Debug: " . ($app['debug'] ? 'ON' : 'OFF') . "\n";
echo "Hello World from PSR-4 Architecture!";
