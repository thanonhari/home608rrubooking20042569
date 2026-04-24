<?php
require_once 'includes/db.php';

try {
    // 1. Re-create rooms table or update (Adding RRU Rooms)
    $pdo->exec("DELETE FROM rooms"); // Clear old samples
    $rooms = [
        ['ห้องราชนครินทร์ ชั้น 5', 'อาคารราชนครินทร์', 1200],
        ['ห้องโชคอนันต์', 'อาคารสัมมนา', 300],
        ['เจ้าพระยา', 'อาคารสัมมนา', 250],
        ['ห้องศรีสยาม 1 และ 2', 'อาคารราชนครินทร์', 160],
        ['ห้องการะเกด', 'อาคารราชนครินทร์', 120],
        ['ห้องเจ้าเสวย', 'อาคารราชนครินทร์', 65],
        ['ห้องทองเจ้าพัฒน์', 'อาคารราชนครินทร์', 60],
        ['ห้องขุนทิพย์', 'อาคารราชนครินทร์', 60],
        ['ห้องเทพนิมิตร', 'อาคารสัมมนา', 15],
        ['ห้องเขียวมรกต', 'อาคารสัมมนา', 8],
        ['ศาลาข้างสนามฟุตบอล', 'ภายนอกอาคาร', 0],
        ['โดม', 'ภายนอกอาคาร', 0],
        ['สนามฟุตบอล', 'ภายนอกอาคาร', 0],
        ['ห้องสเตจ', 'อาคารสเตจ', 0],
        ['ชั้น 1 อาคารราชนครินทร์', 'อาคารราชนครินทร์', 0]
    ];
    $stmt = $pdo->prepare("INSERT INTO rooms (name, description, capacity) VALUES (?, ?, ?)");
    foreach ($rooms as $r) $stmt->execute($r);

    // 2. Add RRU fields to bookings table
    $fields = [
        "title VARCHAR(255) NOT NULL",
        "position VARCHAR(100)",
        "department VARCHAR(255)",
        "phone VARCHAR(20)",
        "participants_count INT DEFAULT 0",
        "setup_participants INT DEFAULT 0",
        "setup_speakers INT DEFAULT 0",
        "setup_snacks INT DEFAULT 0",
        "setup_registration INT DEFAULT 0",
        "equip_audio TINYINT(1) DEFAULT 0",
        "equip_projector TINYINT(1) DEFAULT 0",
        "equip_visualizer TINYINT(1) DEFAULT 0",
        "equip_other TEXT",
        "room_layout ENUM('A', 'B', 'C', 'D') DEFAULT 'A'",
        "prep_start DATETIME",
        "prep_end DATETIME"
    ];

    foreach ($fields as $field) {
        try {
            $pdo->exec("ALTER TABLE bookings ADD COLUMN $field");
        } catch (Exception $e) {
            // Field might already exist
        }
    }

    echo "RRU Database Migration successful. Rooms updated and Booking fields added.";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage();
}
?>
