-- Room Booking System Schema

CREATE DATABASE IF NOT EXISTS room_booking;
USE room_booking;

-- Users table with RBAC
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'approver', 'staff', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    equipment TEXT, -- New: comma-separated tags or JSON
    photo_url VARCHAR(255),
    capacity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bookings table with RRU specific fields
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL, -- ชื่องาน/โครงการ
    position VARCHAR(100), -- ตำแหน่ง
    department VARCHAR(255), -- สังกัด
    phone VARCHAR(20), -- โทรศัพท์
    participants_count INT DEFAULT 0, -- จำนวนผู้เข้าร่วม
    
    -- การจัดการโต๊ะ-เก้าอี้
    setup_participants INT DEFAULT 0,
    setup_speakers INT DEFAULT 0,
    setup_snacks INT DEFAULT 0,
    setup_registration INT DEFAULT 0,
    
    -- อุปกรณ์
    equip_audio TINYINT(1) DEFAULT 0,
    equip_projector TINYINT(1) DEFAULT 0,
    equip_visualizer TINYINT(1) DEFAULT 0,
    equip_other TEXT,
    
    -- รูปแบบการจัดห้อง
    room_layout ENUM('A', 'B', 'C', 'D') DEFAULT 'A',
    
    -- เวลาเตรียมสถานที่
    prep_start DATETIME,
    prep_end DATETIME,
    
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT no_overlap CHECK (start_time < end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TRUNCATE rooms; -- Clear old samples
INSERT IGNORE INTO rooms (name, description, capacity) VALUES 
('ห้องราชนครินทร์ ชั้น 5', 'อาคารราชนครินทร์', 1200),
('ห้องโชคอนันต์', 'อาคารสัมมนา', 300),
('เจ้าพระยา', 'อาคารสัมมนา', 250),
('ห้องศรีสยาม 1 และ 2', 'อาคารราชนครินทร์', 160),
('ห้องการะเกด', 'อาคารราชนครินทร์', 120),
('ห้องเจ้าเสวย', 'อาคารราชนครินทร์', 65),
('ห้องทองเจ้าพัฒน์', 'อาคารราชนครินทร์', 60),
('ห้องขุนทิพย์', 'อาคารราชนครินทร์', 60),
('ห้องเทพนิมิตร', 'อาคารสัมมนา', 15),
('ห้องเขียวมรกต', 'อาคารสัมมนา', 8),
('ศาลาข้างสนามฟุตบอล', 'ภายนอกอาคาร', 0),
('โดม', 'ภายนอกอาคาร', 0),
('สนามฟุตบอล', 'ภายนอกอาคาร', 0),
('ห้องสเตจ', 'อาคารสเตจ', 0),
('ชั้น 1 อาคารราชนครินทร์', 'อาคารราชนครินทร์', 0);

-- Initial Settings
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
('telegram_bot_token', ''),
('telegram_chat_id', '');
