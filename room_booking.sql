-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 21, 2026 at 11:30 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `room_booking`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `details`, `ip_address`, `created_at`) VALUES
(1, NULL, 'LOGIN_FAILED', 'Failed login attempt for username: admin', '::1', '2026-04-21 04:11:15'),
(2, NULL, 'LOGIN_FAILED', 'Failed login attempt for username: admin', '::1', '2026-04-21 04:14:06'),
(3, NULL, 'LOGIN_FAILED', 'Failed login attempt for username: admin', '::1', '2026-04-21 04:14:19'),
(4, NULL, 'USER_REGISTERED', 'New user registration: thanon', '::1', '2026-04-21 04:14:49'),
(5, NULL, 'LOGIN_BLOCKED', 'Blocked login for pending user: thanon', '::1', '2026-04-21 04:15:02'),
(6, NULL, 'LOGIN_FAILED', 'Failed login attempt for username: admin', '::1', '2026-04-21 04:15:17'),
(7, NULL, 'LOGIN_FAILED', 'Failed login attempt for username: admin', '::1', '2026-04-21 04:18:09'),
(8, NULL, 'LOGIN_FAILED', 'Failed login attempt for username: admin', '::1', '2026-04-21 04:18:26'),
(9, 2, 'LOGIN', 'User admin logged in', '::1', '2026-04-21 04:21:13'),
(10, 2, 'USER_STATUS_UPDATED', 'User ID 1 status changed to active', '::1', '2026-04-21 04:21:31'),
(11, 2, 'LOGOUT', 'User admin logged out', '::1', '2026-04-21 04:21:34'),
(12, 1, 'LOGIN', 'User thanon logged in', '::1', '2026-04-21 04:21:45'),
(13, 1, 'BOOKING_CREATED', 'New booking: fdsa (Room ID: 5)', '::1', '2026-04-21 06:03:48'),
(14, 1, 'LOGOUT', 'User thanon logged out', '::1', '2026-04-21 06:11:48'),
(15, 1, 'LOGIN', 'User thanon logged in', '::1', '2026-04-21 07:12:03'),
(16, 1, 'LOGOUT', 'User thanon logged out', '::1', '2026-04-21 07:12:17'),
(17, 1, 'LOGIN', 'User thanon logged in', '::1', '2026-04-21 07:33:45'),
(18, 1, 'LOGOUT', 'User thanon logged out', '::1', '2026-04-21 07:38:30'),
(19, 1, 'LOGIN', 'User thanon logged in', '::1', '2026-04-21 07:38:46'),
(20, 1, 'LOGOUT', 'User thanon logged out', '::1', '2026-04-21 07:40:00'),
(21, NULL, 'USER_REGISTERED', 'New user registration: thanonhari', '::1', '2026-04-21 08:17:23'),
(22, NULL, 'LOGIN_BLOCKED', 'Blocked login for pending user: thanonhari', '::1', '2026-04-21 08:17:41'),
(23, NULL, 'LOGIN_BLOCKED', 'Blocked login for pending user: thanonhari', '::1', '2026-04-21 08:17:56'),
(24, 2, 'LOGIN', 'User admin logged in', '::1', '2026-04-21 08:18:09'),
(25, 2, 'USER_STATUS_UPDATED', 'User ID 3 status changed to active', '::1', '2026-04-21 08:18:25'),
(26, 2, 'LOGOUT', 'User admin logged out', '::1', '2026-04-21 08:18:40'),
(27, 3, 'LOGIN', 'User thanonhari logged in', '::1', '2026-04-21 08:18:58'),
(28, 3, 'LOGOUT', 'User thanonhari logged out', '::1', '2026-04-21 08:46:18'),
(29, 3, 'LOGIN', 'User thanonhari logged in', '::1', '2026-04-21 08:46:37'),
(30, 3, 'LOGOUT', 'User thanonhari logged out', '::1', '2026-04-21 08:59:29'),
(31, 1, 'LOGIN', 'User thanon logged in', '::1', '2026-04-21 09:03:52'),
(32, 1, 'LOGOUT', 'User thanon logged out', '::1', '2026-04-21 09:04:14'),
(33, 2, 'LOGIN', 'User admin logged in', '::1', '2026-04-21 09:04:28'),
(34, 2, 'LOGOUT', 'User admin logged out', '::1', '2026-04-21 09:05:44'),
(35, NULL, 'USER_REGISTERED', 'New user registration: somchai', '::1', '2026-04-21 09:24:49'),
(36, 2, 'LOGIN', 'User admin logged in', '::1', '2026-04-21 09:25:08'),
(37, 2, 'LOGOUT', 'User admin logged out', '::1', '2026-04-21 09:25:37');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `position` varchar(100) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `participants_count` int(11) DEFAULT 0,
  `setup_participants` int(11) DEFAULT 0,
  `setup_speakers` int(11) DEFAULT 0,
  `setup_snacks` int(11) DEFAULT 0,
  `setup_registration` int(11) DEFAULT 0,
  `equip_audio` tinyint(1) DEFAULT 0,
  `equip_projector` tinyint(1) DEFAULT 0,
  `equip_visualizer` tinyint(1) DEFAULT 0,
  `equip_other` text DEFAULT NULL,
  `room_layout` enum('A','B','C','D') DEFAULT 'A',
  `prep_start` datetime DEFAULT NULL,
  `prep_end` datetime DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `room_id`, `user_id`, `title`, `position`, `department`, `phone`, `participants_count`, `setup_participants`, `setup_speakers`, `setup_snacks`, `setup_registration`, `equip_audio`, `equip_projector`, `equip_visualizer`, `equip_other`, `room_layout`, `prep_start`, `prep_end`, `start_time`, `end_time`, `status`, `created_at`) VALUES
(1, 13, 1, 'football', 'นักวิชาการคอม', 'สวท', '6532', 30, 300, 1, 1, 2, 1, 1, 1, '', 'B', NULL, NULL, '2026-04-24 09:00:00', '2026-04-24 16:00:00', 'pending', '2026-04-21 04:23:10'),
(2, 7, 1, 'thanon', 'o;dafds', 'fdsaf', '6522', 30, 30, 0, 0, 0, 1, 1, 1, '', 'C', NULL, NULL, '2026-04-24 09:00:00', '2026-04-24 16:00:00', 'pending', '2026-04-21 04:56:37'),
(3, 15, 1, 'xfds', 'fdsafsd', 'fdsafsda', 'fdsafsd', 24, 32, 0, 0, 0, 1, 0, 0, '', 'A', NULL, NULL, '2026-04-24 09:00:00', '2026-04-24 16:00:00', 'pending', '2026-04-21 06:00:30'),
(4, 5, 1, 'fdsa', 'fdsa', 'fdsa', 'fdsa', 33, 33, 0, 0, 0, 0, 1, 0, '', 'A', NULL, NULL, '2026-04-24 09:00:00', '2026-04-24 16:00:00', 'pending', '2026-04-21 06:03:48');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`) VALUES
(1, 'คณะครุศาสตร์'),
(5, 'คณะพยาบาลศาสตร์'),
(2, 'คณะมนุษยศาสตร์และสังคมศาสตร์'),
(4, 'คณะวิทยาการจัดการ'),
(3, 'คณะวิทยาศาสตร์และเทคโนโลยี'),
(10, 'ศูนย์ฝึกประสบการณ์วิชาชีพ'),
(9, 'ศูนย์ภาษา'),
(6, 'สำนักงานอธิการบดี'),
(8, 'สำนักทะเบียนและประมวลผล'),
(7, 'สำนักวิทยบริการและเทคโนโลยีสารสนเทศ');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`id`, `name`) VALUES
(3, 'คณบดี'),
(5, 'นักวิชาการคอมพิวเตอร์'),
(6, 'บุคคลภายนอก'),
(2, 'หัวหน้าภาควิชา'),
(1, 'อาจารย์'),
(4, 'เจ้าหน้าที่บริหารงานทั่วไป');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `equipment` text DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `capacity` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `name`, `description`, `equipment`, `photo_url`, `capacity`, `created_at`) VALUES
(1, 'ห้องราชนครินทร์ ชั้น 5', 'อาคารราชนครินทร์', NULL, NULL, 1200, '2026-04-21 04:09:00'),
(2, 'ห้องโชคอนันต์', 'อาคารสัมมนา', NULL, NULL, 300, '2026-04-21 04:09:00'),
(3, 'เจ้าพระยา', 'อาคารสัมมนา', NULL, NULL, 250, '2026-04-21 04:09:00'),
(4, 'ห้องศรีสยาม 1 และ 2', 'อาคารราชนครินทร์', NULL, NULL, 160, '2026-04-21 04:09:00'),
(5, 'ห้องการะเกด', 'อาคารราชนครินทร์', NULL, NULL, 120, '2026-04-21 04:09:00'),
(6, 'ห้องเจ้าเสวย', 'อาคารราชนครินทร์', NULL, NULL, 65, '2026-04-21 04:09:00'),
(7, 'ห้องทองเจ้าพัฒน์', 'อาคารราชนครินทร์', NULL, NULL, 60, '2026-04-21 04:09:00'),
(8, 'ห้องขุนทิพย์', 'อาคารราชนครินทร์', NULL, NULL, 60, '2026-04-21 04:09:00'),
(9, 'ห้องเทพนิมิตร', 'อาคารสัมมนา', NULL, NULL, 15, '2026-04-21 04:09:00'),
(10, 'ห้องเขียวมรกต', 'อาคารสัมมนา', NULL, NULL, 8, '2026-04-21 04:09:00'),
(11, 'ศาลาข้างสนามฟุตบอล', 'ภายนอกอาคาร', NULL, NULL, 0, '2026-04-21 04:09:00'),
(12, 'โดม', 'ภายนอกอาคาร', NULL, NULL, 0, '2026-04-21 04:09:00'),
(13, 'สนามฟุตบอล', 'ภายนอกอาคาร', NULL, NULL, 0, '2026-04-21 04:09:00'),
(14, 'ห้องสเตจ', 'อาคารสเตจ', NULL, NULL, 0, '2026-04-21 04:09:00'),
(15, 'ชั้น 1 อาคารราชนครินทร์', 'อาคารราชนครินทร์', NULL, NULL, 0, '2026-04-21 04:09:00');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('telegram_bot_token', ''),
('telegram_chat_id', '');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `prefix` varchar(20) DEFAULT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','approver','staff','user') DEFAULT 'user',
  `status` enum('active','pending','suspended') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `position` varchar(100) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `prefix`, `fullname`, `password_hash`, `role`, `status`, `created_at`, `position`, `department`, `phone`) VALUES
(1, 'thanon', NULL, NULL, '$2y$10$F/8TDbwLfGmBsRc5VeajD.dpxnh4zYUh25Uh4Mx228n4aX3EQQeJK', 'user', 'active', '2026-04-21 04:14:49', NULL, NULL, NULL),
(2, 'admin', NULL, NULL, '$2y$10$1YHrPUsTN5p/xNKG/lhi1epnalQHfuKqaEHJiWi4vMCkwG.vFm4o.', 'admin', 'active', '2026-04-21 04:20:33', NULL, NULL, NULL),
(3, 'thanonhari', 'นาย', 'ธนนท์ หริการบัญชร', '$2y$10$hay9aJqQIIMZAmQazEYgSuYpneGk7k2mgkd3rTXlvmRUhM1AbiGHO', 'user', 'active', '2026-04-21 08:17:23', 'เจ้าหน้าที่บริหารงานทั่วไป', 'ศูนย์ฝึกประสบการณ์วิชาชีพ', '6532'),
(4, 'somchai', 'นาย', 'สมชาย ใจดี', '$2y$10$4iDlub2a7H87PNrJ8waH6ejZ8KktbS5R5DbkmLtBKsip.yD9e29ea', 'user', 'pending', '2026-04-21 09:24:49', 'พนักงานมหาวิทยาลัย', 'งานติดตั้งและซ่อมบำรุง', '087123456789');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
