-- Room Booking System Schema (Latest Version for Docker)
-- Updated: April 25, 2026

CREATE DATABASE IF NOT EXISTS room_booking;
USE room_booking;

-- 1. Users table with RBAC and External support
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    prefix VARCHAR(20),
    fullname VARCHAR(100) NOT NULL,
    role ENUM('admin', 'approver', 'staff', 'user') DEFAULT 'user',
    user_type ENUM('internal', 'external') DEFAULT 'internal',
    status ENUM('active', 'pending', 'inactive') DEFAULT 'pending',
    position VARCHAR(100),
    department VARCHAR(255),
    organization VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Rooms table with 2021 Rates
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INT NOT NULL,
    rate_4h DECIMAL(10,2) DEFAULT 0.00,
    rate_8h DECIMAL(10,2) DEFAULT 0.00,
    extra_electricity_per_h DECIMAL(10,2) DEFAULT 0.00,
    extra_staff_per_h DECIMAL(10,2) DEFAULT 0.00,
    main_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Bookings table with Financial Tracking
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    purpose_type ENUM('meeting', 'wedding', 'banquet', 'other') DEFAULT 'meeting',
    position VARCHAR(100),
    department VARCHAR(255),
    organization VARCHAR(255),
    address TEXT,
    line_id VARCHAR(50),
    phone VARCHAR(20),
    participants_count INT DEFAULT 0,
    setup_participants INT DEFAULT 0,
    setup_speakers INT DEFAULT 0,
    setup_snacks INT DEFAULT 0,
    setup_registration INT DEFAULT 0,
    equip_audio TINYINT(1) DEFAULT 0,
    equip_projector TINYINT(1) DEFAULT 0,
    equip_visualizer TINYINT(1) DEFAULT 0,
    equip_other TEXT,
    room_layout VARCHAR(50) DEFAULT 'A',
    prep_start DATETIME,
    prep_end DATETIME,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    attachment_path VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    deposit_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status ENUM('pending', 'partial', 'paid') DEFAULT 'pending',
    check_in_time DATETIME,
    check_out_time DATETIME,
    rating INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Initial Master Data (Rooms & Rates)
INSERT IGNORE INTO rooms (name, capacity, rate_4h, rate_8h, extra_electricity_per_h, extra_staff_per_h) VALUES 
('ห้องโโชคนันท์ ชั้น 2', 300, 14000, 21500, 1500, 400),
('ห้องเขียวมรกต ชั้น 2', 10, 1500, 2000, 1000, 200),
('ห้องทองเจ้าพัฒน์ ชั้น 4', 50, 7200, 10200, 1000, 200),
('ห้องเทพนิมิตร ชั้น 4', 10, 1500, 2000, 1000, 200),
('ห้องมหาชนก ชั้น 5', 30, 7200, 10200, 1000, 200),
('ห้องประชุมสภาคณาจารย์ ชั้น 3', 20, 1500, 2000, 1000, 200),
('ห้องขุนทิพย์ ชั้น 3', 40, 7200, 10200, 1000, 200),
('ห้องเจ้าเสวย ชั้น 4', 60, 10200, 16200, 1000, 200),
('ห้องทูลถวาย ชั้น 4', 30, 7200, 10200, 1000, 200),
('ห้องนวลจันทร์ ชั้น 4', 30, 7200, 10200, 1000, 200),
('ห้องศรีสยาม ชั้น 4', 350, 10700, 17200, 1000, 300),
('ห้องประชุมราชนครินทร์ ชั้น 5', 1200, 39000, 49000, 2500, 800),
('ห้องหงษ์ทอง ชั้น 2', 30, 7200, 10200, 1000, 200),
('ห้องเจ้าพระยา ชั้น 3', 250, 11700, 18700, 1500, 300),
('ห้องการะเกด', 150, 11700, 18700, 1500, 300),
('ห้องเสตจ', 100, 10200, 16200, 1000, 200),
('ห้องคอมพิวเตอร์ 400', 40, 10200, 16200, 1000, 200);

-- Initial Settings
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
('telegram_bot_token', ''),
('telegram_chat_id', ''),
('smtp_host', 'smtp.gmail.com'),
('smtp_port', '587'),
('smtp_user', ''),
('smtp_pass', '');
