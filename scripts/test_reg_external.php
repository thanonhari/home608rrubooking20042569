<?php
/**
 * Test External User Registration
 * Simulates a POST request to api/register.php
 */

$testData = [
    'username' => 'test_external_' . time(),
    'password' => 'password123',
    'prefix' => 'นาย',
    'fullname' => 'ทดสอบ บุคคลภายนอก',
    'user_type' => 'external',
    'organization' => 'บริษัท ทดสอบ จำกัด',
    'position' => 'ผู้จัดการ',
    'department' => 'ฝ่ายขาย',
    'phone' => '0812345678',
    'email' => 'test_external@example.com'
];

echo "--- Simulating External User Registration ---\n";
echo "Username: " . $testData['username'] . "\n";
echo "Organization: " . $testData['organization'] . "\n";

// Use curl to call the API locally
$url = 'http://localhost/thanonroom20042569/api/register.php';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status Code: $httpCode\n";
echo "Response: $response\n";

if ($httpCode === 200) {
    echo "\n--- SUCCESS: Registration API responded correctly. ---\n";
    
    // Verify in database
    require_once __DIR__ . '/../includes/db.php';
    $stmt = $pdo->prepare("SELECT id, username, status, user_type FROM users WHERE username = ?");
    $stmt->execute([$testData['username']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "Database Verification:\n";
        echo "ID: " . $user['id'] . "\n";
        echo "Status: " . $user['status'] . " (Should be 'pending')\n";
        echo "Type: " . $user['user_type'] . " (Should be 'external')\n";
    } else {
        echo "FAILED: User not found in database.\n";
    }
} else {
    echo "\n--- FAILED: API error. ---\n";
}
