<?php
// api/auth.php
require_once __DIR__ . '/base.php';

$action = $_GET['action'] ?? '';
$input = getInput();

switch ($action) {
    case 'login':
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        $remember = !empty($input['remember']);

        if (empty($username) || empty($password)) {
            sendResponse(['error' => 'Missing username or password'], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            if ($user['status'] !== 'active') {
                logAction('LOGIN_BLOCKED', "Blocked login for {$user['status']} user: $username");
                sendResponse(['error' => "Your account is {$user['status']}. Please contact administrator."], 403);
            }

            // Remember Me logic
            if ($remember) {
                $params = session_get_cookie_params();
                setcookie(session_name(), session_id(), time() + (86400 * 30), $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
            }

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            
            logAction('LOGIN', "User {$user['username']} logged in");

            sendResponse([
                'success' => true,
                'user' => [
                    'username' => $user['username'],
                    'prefix' => $user['prefix'],
                    'fullname' => $user['fullname'],
                    'role' => $user['role'],
                    'position' => $user['position'],
                    'department' => $user['department'],
                    'phone' => $user['phone'],
                    'email' => $user['email']
                ]
            ]);
        } else {
            logAction('LOGIN_FAILED', "Failed login attempt for username: $username");
            sendResponse(['error' => 'Invalid credentials'], 401);
        }
        break;

    case 'logout':
        try {
            if (isset($_SESSION['username'])) {
                logAction('LOGOUT', "User {$_SESSION['username']} logged out");
            }
            $_SESSION = array();
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            session_destroy();
            sendResponse(['success' => true]);
        } catch (Exception $e) {
            sendResponse(['success' => true]); // Still return success to allow client cleanup
        }
        break;

    case 'status':
        if (isset($_SESSION['user_id'])) {
            $stmt = $pdo->prepare("SELECT id, username, prefix, fullname, role, position, department, phone, email FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $u = $stmt->fetch();
            sendResponse([
                'loggedIn' => true,
                'user' => $u
            ]);
        } else {
            sendResponse(['loggedIn' => false]);
        }
        break;

    default:
        sendResponse(['error' => 'Invalid action'], 400);
}
