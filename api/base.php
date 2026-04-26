<?php
// api/base.php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../php_errors.log');

// Global Error/Exception Handler for JSON responses
set_exception_handler(function ($e) {
    error_log("Uncaught Exception: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal Server Error',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
    exit;
});

set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) return false;
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

ob_start();
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json');

/**
 * Send a JSON response and exit
 */
function sendResponse($data, $code = 200) {
    if (ob_get_length()) ob_clean();
    http_response_code($code);
    echo json_encode($data);
    exit;
}

/**
 * Middleware: Ensure user is logged in
 */
function requireLogin() {
    if (!isset($_SESSION['user_id'])) {
        sendResponse(['error' => 'Authentication required'], 401);
    }
}

/**
 * Middleware: Ensure user has a specific role
 */
function requireRole($roles) {
    requireLogin();
    if (!is_array($roles)) $roles = [$roles];
    
    if (!in_array($_SESSION['role'], $roles)) {
        sendResponse(['error' => 'Permission denied'], 403);
    }
}

/**
 * Get input data (JSON or POST)
 */
function getInput() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    return $data ?: $_POST;
}

/**
 * Record an action in the audit log
 */
function logAction($action, $details = null) {
    global $pdo;
    $userId = $_SESSION['user_id'] ?? null;
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'CLI';
    $url = $_SERVER['REQUEST_URI'] ?? 'UNKNOWN';
    
    $contextualDetails = [
        'info' => $details,
        'method' => $method,
        'url' => $url
    ];
    $jsonDetails = json_encode($contextualDetails, JSON_UNESCAPED_UNICODE);

    try {
        $stmt = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userId, $action, $jsonDetails, $ip]);
    } catch (Exception $e) {
        error_log("Logging failed: " . $e->getMessage());
    }
}

/**
 * Strict Input Validation Helper
 */
function validate($data, $rules) {
    $errors = [];
    foreach ($rules as $field => $rule) {
        $val = $data[$field] ?? null;
        $params = explode('|', $rule);
        
        foreach ($params as $p) {
            if ($p === 'required' && ($val === null || $val === '')) $errors[] = "$field is required";
            if ($p === 'numeric' && $val !== null && !is_numeric($val)) $errors[] = "$field must be numeric";
            if ($p === 'email' && $val !== null && !filter_var($val, FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email format";
            if (str_starts_with($p, 'min:')) {
                $min = (int)substr($p, 4);
                if ($val !== null && strlen((string)$val) < $min) $errors[] = "$field must be at least $min chars";
            }
        }
    }
    if (!empty($errors)) {
        sendResponse(['error' => 'Validation failed', 'details' => $errors], 422);
    }
    return true;
}
