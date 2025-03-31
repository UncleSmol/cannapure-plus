-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 26, 2025 at 07:25 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cannapureplus_dev`
--

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) NOT NULL,
  `attempt_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `success` tinyint(1) DEFAULT 0,
  `attempt_details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `user_id`, `email`, `ip_address`, `attempt_time`, `success`, `attempt_details`) VALUES
(43, 1, 'doe.jon@outlook.com', '::ffff:127.0.0.1', '2025-03-19 17:30:14', 1, 'Login successful'),
(44, 1, 'doe.jon@outlook.com', '::ffff:127.0.0.1', '2025-03-19 17:35:41', 1, 'Login successful'),
(45, 1, 'doe.jon@outlook.com', '::ffff:127.0.0.1', '2025-03-19 17:45:41', 1, 'Login successful'),
(46, 1, 'doe.jon@outlook.com', '::ffff:127.0.0.1', '2025-03-19 18:01:02', 1, 'Login successful'),
(47, 6, 'dev.doc@outlook.com', '::ffff:127.0.0.1', '2025-03-19 18:12:05', 1, 'Login successful'),
(48, 6, 'dev.doc@outlook.com', '::ffff:127.0.0.1', '2025-03-19 18:12:33', 1, 'Login successful'),
(49, 6, 'dev.doc@outlook.com', '::ffff:127.0.0.1', '2025-03-19 19:22:45', 1, 'Login successful'),
(50, 1, 'doe.jon@outlook.com', '::ffff:127.0.0.1', '2025-03-20 08:33:45', 1, 'Login successful'),
(51, 1, 'doe.jon@outlook.com', '::ffff:127.0.0.1', '2025-03-20 16:11:56', 1, 'Login successful'),
(52, 1, 'doe.jon@outlook.com', '::ffff:127.0.0.1', '2025-03-26 06:09:20', 1, 'Login successful');

-- --------------------------------------------------------

--
-- Table structure for table `strains`
--

CREATE TABLE `strains` (
  `id` int(11) NOT NULL,
  `strain_name` varchar(255) NOT NULL,
  `category` enum('medical','edible','extract','pre_rolled','indoor','greenhouse','exotic','normal') NOT NULL COMMENT 'Corresponds to legacy table names',
  `strain_type` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `measurement` varchar(50) NOT NULL DEFAULT '3g',
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `store_location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `special` tinyint(1) DEFAULT 0,
  `thc` decimal(5,2) DEFAULT NULL COMMENT 'THC percentage (0-100)',
  `cbd` decimal(5,2) DEFAULT NULL COMMENT 'CBD percentage (0-100)',
  `specials_tag` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `strains`
--

INSERT INTO `strains` (`id`, `strain_name`, `category`, `strain_type`, `price`, `measurement`, `description`, `image_url`, `store_location`, `created_at`, `special`, `thc`, `cbd`, `specials_tag`) VALUES
(1, 'ACDC', 'medical', 'Hybrid', 170.00, '3g', 'High CBD strain for pain relief', 'https://images.pexels.com/photos/7584591/pexels-photo-7584591.jpeg', 'DULLSTROOM', '2025-03-11 14:19:53', 0, 1.00, 20.00, NULL),
(2, 'Harlequin', 'medical', 'Sativa', 165.00, '3g', 'Balanced CBD:THC for anxiety', 'https://images.pexels.com/photos/7584526/pexels-photo-7584526.jpeg', 'WITBANK', '2025-03-11 14:19:53', 0, 5.00, 8.00, NULL),
(3, 'Charlotte\'s Web', 'medical', 'Indica', 175.00, '3g', 'High CBD for therapeutic use', 'https://images.pexels.com/photos/7584538/pexels-photo-7584538.jpeg', 'DULLSTROOM', '2025-03-11 14:19:53', 0, 0.50, 17.00, NULL),
(4, 'Wedding Cake', 'indoor', 'Hybrid', 180.00, '3g', 'Rich and tangy with relaxing effects', 'https://images.pexels.com/photos/7584553/pexels-photo-7584553.jpeg', 'DULLSTROOM', '2025-03-11 14:19:52', 0, 25.00, NULL, NULL),
(5, 'Gelato', 'indoor', 'Hybrid', 190.00, '3g', 'Sweet and creamy with balanced effects', 'https://images.pexels.com/photos/7584559/pexels-photo-7584559.jpeg', 'WITBANK', '2025-03-11 14:19:52', 0, 22.00, NULL, NULL),
(6, 'GG4', 'indoor', 'Hybrid', 185.00, '3g', 'Diesel aroma with powerful effects', 'https://images.pexels.com/photos/7584562/pexels-photo-7584562.jpeg', 'DULLSTROOM', '2025-03-11 14:19:52', 0, 24.00, NULL, NULL),
(7, 'Zkittlez', 'exotic', 'Indica', 200.00, '3g', 'Tropical fruit flavor with euphoric effects', 'https://images.pexels.com/photos/7584571/pexels-photo-7584571.jpeg', 'WITBANK', '2025-03-11 14:19:52', 0, 23.00, NULL, 'TRUE'),
(8, 'Runtz', 'exotic', 'Hybrid', 210.00, '3g', 'Sweet candy flavor with potent effects', 'https://images.pexels.com/photos/7584567/pexels-photo-7584567.jpeg', 'DULLSTROOM', '2025-03-11 14:19:52', 0, 27.00, NULL, 'FALSE'),
(9, 'Ice Cream Cake', 'exotic', 'Indica', 205.00, '3g', 'Creamy vanilla with relaxing effects', 'https://images.pexels.com/photos/7584582/pexels-photo-7584582.jpeg', 'WITBANK', '2025-03-11 14:19:52', 0, 25.00, NULL, NULL),
(10, 'Blue Dream Vape', 'extract', 'Hybrid', 300.00, '1g', 'Premium distillate cartridge', 'https://images.pexels.com/photos/7584562/pexels-photo-7584562.jpeg', 'DULLSTROOM', '2025-03-11 14:19:53', 0, 85.00, NULL, NULL),
(11, 'OG Kush Shatter', 'extract', 'Indica', 280.00, '1g', 'Pure concentrate for dabbing', 'https://images.pexels.com/photos/7584571/pexels-photo-7584571.jpeg', 'WITBANK', '2025-03-11 14:19:53', 0, 90.00, NULL, NULL),
(12, 'Sour Diesel Live Resin', 'extract', 'Sativa', 320.00, '1g', 'Full-spectrum extract', 'https://images.pexels.com/photos/7584567/pexels-photo-7584567.jpeg', 'DULLSTROOM', '2025-03-11 14:19:53', 0, 82.00, NULL, NULL),
(13, 'Lemon Haze', 'greenhouse', 'Sativa', 150.00, '3g', 'Citrus flavor with energetic effects', 'https://images.pexels.com/photos/7584526/pexels-photo-7584526.jpeg', 'WITBANK', '2025-03-11 14:19:52', 0, 19.00, NULL, NULL),
(14, 'Purple Kush', 'greenhouse', 'Indica', 160.00, '3g', 'Sweet grape flavor with deep relaxation', 'https://images.pexels.com/photos/7584538/pexels-photo-7584538.jpeg', 'DULLSTROOM', '2025-03-11 14:19:52', 0, 20.00, NULL, NULL),
(15, 'Jack Herer', 'greenhouse', 'Sativa', 155.00, '3g', 'Pine-forward aroma with creative effects', 'https://images.pexels.com/photos/7584544/pexels-photo-7584544.jpeg', 'WITBANK', '2025-03-11 14:19:52', 0, 18.00, NULL, NULL),
(16, 'Blue Dream', 'normal', 'Hybrid', 120.00, '3g', 'Sweet berry aroma with balanced effects', 'https://images.pexels.com/photos/7584567/pexels-photo-7584567.jpeg', 'WITBANK', '2025-03-11 14:19:52', 0, 18.00, NULL, NULL),
(17, 'Green Crack', 'normal', 'Sativa', 130.00, '3g', 'Sharp energy and focus with tropical flavor', 'https://images.pexels.com/photos/7584582/pexels-photo-7584582.jpeg', 'DULLSTROOM', '2025-03-11 14:19:52', 0, 17.00, NULL, NULL),
(18, 'Northern Lights', 'normal', 'Indica', 140.00, '3g', 'Sweet and spicy with relaxing effects', 'https://images.pexels.com/photos/7584591/pexels-photo-7584591.jpeg', 'WITBANK', '2025-03-11 14:19:52', 0, 16.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `id_number` varchar(13) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `surname` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` text NOT NULL,
  `password` varchar(255) NOT NULL,
  `cpNumber` varchar(50) DEFAULT NULL,
  `cp_issued_date` timestamp NULL DEFAULT NULL,
  `cp_status` enum('ACTIVE','SUSPENDED','REVOKED') DEFAULT NULL,
  `account_status` enum('PENDING','ACTIVE','SUSPENDED','BANNED') NOT NULL DEFAULT 'PENDING',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` timestamp NULL DEFAULT NULL,
  `modified_by` int(11) DEFAULT NULL,
  `modification_reason` text DEFAULT NULL,
  `last_login_attempt` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int(11) DEFAULT 0,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `device_fingerprint` text DEFAULT NULL,
  `is_locked` tinyint(1) DEFAULT 0,
  `lock_reason` text DEFAULT NULL,
  `lock_expires_at` timestamp NULL DEFAULT NULL,
  `membership_tier` enum('GOLD','DIAMOND','EMERALD','TROPEZ','BASIC') DEFAULT 'BASIC',
  `membership_start_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `active_days` int(11) DEFAULT 0,
  `days_to_next_tier` int(11) DEFAULT 90,
  `last_active_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `tier_updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `membership_status` enum('ACTIVE','PAUSED','EXPIRED') DEFAULT 'ACTIVE',
  `pause_date` timestamp NULL DEFAULT NULL,
  `total_pause_days` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `id_number`, `first_name`, `last_name`, `surname`, `email`, `phone_number`, `address`, `password`, `cpNumber`, `cp_issued_date`, `cp_status`, `account_status`, `last_login`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`, `modified_by`, `modification_reason`, `last_login_attempt`, `failed_login_attempts`, `last_login_ip`, `device_fingerprint`, `is_locked`, `lock_reason`, `lock_expires_at`, `membership_tier`, `membership_start_date`, `active_days`, `days_to_next_tier`, `last_active_date`, `tier_updated_at`, `membership_status`, `pause_date`, `total_pause_days`) VALUES
(1, '9300111575088', 'Ntsako', 'Khoza', NULL, 'doe.jon@outlook.com', '0887878987', '51 New Village\nWaterval Boven\n1195', '$2b$10$PFd4Y23GRZVm00hdj0RVbe88D5o86GTZze8hr8UfXgnNE/Z2P0OY2', 'CP123', '2025-03-13 09:06:36', 'ACTIVE', 'ACTIVE', '2025-03-26 06:09:20', '2025-03-13 09:05:30', '2025-03-26 06:09:20', NULL, NULL, NULL, NULL, NULL, 0, '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', 0, NULL, NULL, 'BASIC', '2025-03-13 09:05:30', 0, 90, '2025-03-15 07:44:48', '2025-03-13 09:05:30', 'ACTIVE', NULL, 0),
(6, '9504091575088', 'Ntsako', 'Khoza', NULL, 'dev.doc@outlook.com', '0833899659', '3 De Waal\nModelpark\nemalahleni\n1034', '$2b$10$Di9OtKd/Z6pcfu68JQqUQOknOnKgSIS9VEl8KxqoEdSSSxLDV.OQO', 'CP100', '2025-03-19 18:11:25', 'ACTIVE', 'ACTIVE', '2025-03-19 19:22:43', '2025-03-19 18:09:03', '2025-03-19 19:22:43', NULL, NULL, NULL, NULL, NULL, 0, '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', 0, NULL, NULL, 'BASIC', '2025-03-19 18:09:03', 0, 90, '2025-03-19 18:09:03', '2025-03-19 18:09:03', 'ACTIVE', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_activity_logs`
--

CREATE TABLE `user_activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `activity_type` varchar(50) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `device_info` text DEFAULT NULL,
  `activity_details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_activity_logs`
--

INSERT INTO `user_activity_logs` (`id`, `user_id`, `activity_type`, `ip_address`, `device_info`, `activity_details`, `created_at`) VALUES
(107, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-19 17:30:15'),
(108, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-19 17:35:42'),
(109, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-19 17:45:12'),
(110, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-19 17:45:41'),
(111, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-19 17:52:18'),
(112, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-19 18:01:02'),
(113, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-19 18:01:14'),
(114, 6, 'REGISTRATION', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"email\":\"dev.doc@outlook.com\",\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-19 18:09:03'),
(115, 6, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-19 18:12:06'),
(116, 6, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-19 18:12:16'),
(117, 6, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-19 18:12:33'),
(118, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-19 18:49:56'),
(119, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-19 18:49:56'),
(120, 6, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-19 19:22:45'),
(121, 6, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-19 20:31:58'),
(122, 6, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-19 20:31:58'),
(123, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-20 08:33:45'),
(124, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-20 08:34:59'),
(125, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-20 16:11:56'),
(126, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-20 17:33:20'),
(127, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-20 17:33:20'),
(128, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-26 06:09:20');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `device_info` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_valid` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `device_info`, `ip_address`, `created_at`, `expires_at`, `is_valid`) VALUES
(40, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MjQwNTQxNCwiZXhwIjoxNzQzMDEwMjE0fQ.DkxfVdNEqXKxzIK7Fy3GhNuLTe-v3WTtmEOCQn7w-qw', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-19 17:30:14', '2025-03-26 17:30:14', 0),
(41, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MjQwNTc0MSwiZXhwIjoxNzQzMDEwNTQxfQ.n2AGo5FSUYMjqWyggnw71rlY2HSbtAanwVnMefWEWbY', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-19 17:35:41', '2025-03-26 17:35:41', 0),
(42, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MjQwNjM0MSwiZXhwIjoxNzQzMDExMTQxfQ.O0idqvdIt2Cmf2Glq-x0FFwOmz_qZLZ6P3RuAzQHlqQ', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-19 17:45:41', '2025-03-26 17:45:41', 0),
(43, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MjQwNzI2MiwiZXhwIjoxNzQzMDEyMDYyfQ.A81yGT60g77uc_uny8RVMXCu_m2jSJxCt4pk8ZDENMI', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-19 18:01:02', '2025-03-26 18:01:02', 0),
(44, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MjQwNzkyNSwiZXhwIjoxNzQzMDEyNzI1fQ.rJosPfRvd8nRuAJO40SLSaVduJAZB--aWXlTLCnJS38', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-19 18:12:05', '2025-03-26 18:12:05', 0),
(45, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MjQwNzk1MywiZXhwIjoxNzQzMDEyNzUzfQ.EMIFMQdjUHI2uAgDX4pm-U7ckvVfUvZlulWN3OiPI_A', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-19 18:12:33', '2025-03-26 18:12:33', 1),
(46, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MjQxMjE2NCwiZXhwIjoxNzQzMDE2OTY0fQ.48hCH4ROYSeQ3FtBDFEFwKdOQcT5CH-2ArIZQv7Wh8Y', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-19 19:22:44', '2025-03-26 19:22:44', 0),
(47, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MjQ1OTYyNSwiZXhwIjoxNzQzMDY0NDI1fQ.9bmPbp4Es4a0qLzormDCX5wSMd9i16n8mjx-qS4QxEs', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-20 08:33:45', '2025-03-27 08:33:45', 0),
(48, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MjQ4NzExNiwiZXhwIjoxNzQzMDkxOTE2fQ.bcMUe7DTgI992uig9qO_l8hCreymaTju5fxqcPHwIuE', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-20 16:11:56', '2025-03-27 16:11:56', 0),
(49, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0Mjk2OTM2MCwiZXhwIjoxNzQzNTc0MTYwfQ.0GFXXkjrmY-0VM7rXj_XGkY793KaVupv83aCVw0yXSM', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-26 06:09:20', '2025-04-02 06:09:20', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ip_time` (`ip_address`,`attempt_time`),
  ADD KEY `idx_user_time` (`user_id`,`attempt_time`);

--
-- Indexes for table `strains`
--
ALTER TABLE `strains`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_unique_strain_category` (`strain_name`,`category`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_thc` (`thc`),
  ADD KEY `idx_strain_type` (`strain_type`),
  ADD KEY `idx_store_location` (`store_location`),
  ADD KEY `idx_special` (`special`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_number` (`id_number`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `cp_number` (`cpNumber`),
  ADD UNIQUE KEY `cpNumber` (`cpNumber`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_id_number` (`id_number`),
  ADD KEY `idx_cp_number` (`cpNumber`),
  ADD KEY `idx_account_status` (`account_status`);

--
-- Indexes for table `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_activity` (`user_id`,`activity_type`,`created_at`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session_token` (`session_token`),
  ADD KEY `idx_user_sessions` (`user_id`,`is_valid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `strains`
--
ALTER TABLE `strains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD CONSTRAINT `login_attempts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  ADD CONSTRAINT `user_activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
