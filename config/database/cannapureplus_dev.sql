-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 07, 2025 at 02:06 PM
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
(1, 1, 'dev.doc@outlook.com', '::ffff:127.0.0.1', '2025-03-27 16:24:09', 1, 'Login successful'),
(2, 1, 'dev.doc@outlook.com', '::ffff:127.0.0.1', '2025-03-27 18:23:03', 1, 'Login successful'),
(3, 1, 'dev.doc@outlook.com', '::ffff:127.0.0.1', '2025-03-27 18:29:49', 1, 'Login successful'),
(4, 1, 'dev.doc@outlook.com', '::ffff:127.0.0.1', '2025-03-27 22:27:02', 1, 'Login successful'),
(5, 1, 'dev.doc@outlook.com', '::ffff:127.0.0.1', '2025-03-27 22:31:05', 1, 'Login successful'),
(6, 1, 'dev.doc@outlook.com', '::ffff:127.0.0.1', '2025-03-28 09:05:30', 1, 'Login successful'),
(7, 1, 'dev.doc@outlook.com', '::ffff:127.0.0.1', '2025-03-28 10:20:57', 1, 'Login successful'),
(8, 1, 'dev.doc@outlook.com', '::ffff:127.0.0.1', '2025-03-28 11:45:08', 1, 'Login successful'),
(9, 1, 'dev.doc@outlook.com', '::1', '2025-03-31 15:33:28', 1, 'Login successful'),
(10, 1, 'dev.doc@outlook.com', '::1', '2025-03-31 16:30:37', 1, 'Login successful'),
(11, 1, 'dev.doc@outlook.com', '::ffff:127.0.0.1', '2025-04-01 04:35:42', 1, 'Login successful'),
(12, 1, 'dev.doc@outlook.com', '::1', '2025-04-01 10:03:32', 1, 'Login successful'),
(13, 1, 'dev.doc@outlook.com', '::1', '2025-04-01 10:03:37', 1, 'Login successful'),
(14, 1, 'dev.doc@outlook.com', '::1', '2025-04-01 10:40:42', 1, 'Login successful'),
(15, 1, 'dev.doc@outlook.com', '::1', '2025-04-01 10:57:30', 1, 'Login successful'),
(16, 1, 'dev.doc@outlook.com', '::1', '2025-04-01 14:11:13', 1, 'Login successful');

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
(18, 'Northern Lights', 'normal', 'Indica', 140.00, '3g', 'Sweet and spicy with relaxing effects', 'https://images.pexels.com/photos/7584591/pexels-photo-7584591.jpeg', 'WITBANK', '2025-03-11 14:19:52', 0, 16.00, NULL, NULL),
(19, 'Cannatonic', 'medical', 'Hybrid', 180.00, '3g', 'High CBD strain with minimal psychoactive effects', 'https://images.pexels.com/photos/7584544/pexels-photo-7584544.jpeg', 'WITBANK', '2025-03-11 12:19:53', 0, 6.00, 12.00, NULL),
(20, 'Remedy', 'medical', 'Indica', 175.00, '3g', 'Relaxing strain with high CBD for pain management', 'https://images.pexels.com/photos/7584553/pexels-photo-7584553.jpeg', 'DULLSTROOM', '2025-03-11 12:19:53', 0, 1.00, 15.00, NULL),
(21, 'Pennywise', 'medical', 'Hybrid', 170.00, '3g', 'Balanced CBD:THC ratio for therapeutic effects', 'https://images.pexels.com/photos/7584559/pexels-photo-7584559.jpeg', 'WITBANK', '2025-03-11 12:19:53', 0, 7.00, 7.00, NULL),
(22, 'Chocolate Kush Brownie', 'edible', 'Indica', 120.00, '100mg', 'Rich chocolate brownie with potent effects', 'https://images.pexels.com/photos/7584562/pexels-photo-7584562.jpeg', 'DULLSTROOM', '2025-03-11 12:19:53', 0, 100.00, NULL, NULL),
(23, 'Sour Blue Raspberry Gummies', 'edible', 'Hybrid', 150.00, '200mg', 'Fruity gummies with balanced effects', 'https://images.pexels.com/photos/7584567/pexels-photo-7584567.jpeg', 'WITBANK', '2025-03-11 12:19:53', 1, 200.00, NULL, 'NEW'),
(24, 'Mint Chocolate Chip Cookie', 'edible', 'Sativa', 130.00, '150mg', 'Refreshing mint cookie with uplifting effects', 'https://images.pexels.com/photos/7584571/pexels-photo-7584571.jpeg', 'DULLSTROOM', '2025-03-11 12:19:53', 0, 150.00, 10.00, NULL),
(25, 'Girl Scout Cookies Wax', 'extract', 'Hybrid', 350.00, '1g', 'Premium wax concentrate with sweet flavor', 'https://images.pexels.com/photos/7584582/pexels-photo-7584582.jpeg', 'WITBANK', '2025-03-11 12:19:53', 1, 80.00, NULL, 'PREMIUM'),
(26, 'Pineapple Express Rosin', 'extract', 'Sativa', 400.00, '1g', 'Solventless extract with tropical flavor', 'https://images.pexels.com/photos/7584591/pexels-photo-7584591.jpeg', 'DULLSTROOM', '2025-03-11 12:19:53', 0, 75.00, NULL, NULL),
(27, 'Wedding Cake Pre-Roll', 'pre_rolled', 'Hybrid', 80.00, '1g', 'Premium pre-rolled joint with sweet flavor', 'https://images.pexels.com/photos/7584526/pexels-photo-7584526.jpeg', 'WITBANK', '2025-03-11 12:19:53', 0, 24.00, NULL, NULL),
(28, 'Durban Poison Pre-Roll Pack', 'pre_rolled', 'Sativa', 220.00, '3x1g', 'Pack of three energizing pre-rolls', 'https://images.pexels.com/photos/7584538/pexels-photo-7584538.jpeg', 'DULLSTROOM', '2025-03-11 12:19:53', 1, 18.00, NULL, 'BUNDLE'),
(29, 'Granddaddy Purple King Size', 'pre_rolled', 'Indica', 100.00, '1.5g', 'Extra-large pre-roll with relaxing effects', 'https://images.pexels.com/photos/7584544/pexels-photo-7584544.jpeg', 'WITBANK', '2025-03-11 12:19:53', 0, 22.00, NULL, NULL),
(30, 'MAC (Miracle Alien Cookies)', 'indoor', 'Hybrid', 195.00, '3g', 'Creamy citrus flavor with balanced effects', 'https://images.pexels.com/photos/7584553/pexels-photo-7584553.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 23.00, NULL, NULL),
(31, 'Dosidos', 'indoor', 'Indica', 185.00, '3g', 'Sweet minty lime with relaxing effects', 'https://images.pexels.com/photos/7584559/pexels-photo-7584559.jpeg', 'WITBANK', '2025-03-11 12:19:52', 1, 26.00, NULL, 'PREMIUM'),
(32, 'Amnesia Haze', 'greenhouse', 'Sativa', 145.00, '3g', 'Citrus and earthy flavor with energetic effects', 'https://images.pexels.com/photos/7584562/pexels-photo-7584562.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 21.00, NULL, NULL),
(33, 'White Widow', 'greenhouse', 'Hybrid', 150.00, '3g', 'Balanced effects with pine and earthy notes', 'https://images.pexels.com/photos/7584567/pexels-photo-7584567.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 19.00, NULL, NULL),
(34, 'Gary Payton', 'exotic', 'Hybrid', 220.00, '3g', 'Cookie family genetics with gassy flavor', 'https://images.pexels.com/photos/7584571/pexels-photo-7584571.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 1, 28.00, NULL, 'LIMITED'),
(35, 'Khalifa Kush', 'exotic', 'Indica', 215.00, '3g', 'Pine and lemon notes with relaxing effects', 'https://images.pexels.com/photos/7584582/pexels-photo-7584582.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 26.00, NULL, NULL),
(36, 'AK-47', 'normal', 'Hybrid', 125.00, '3g', 'Earthy and floral with long-lasting effects', 'https://images.pexels.com/photos/7584591/pexels-photo-7584591.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 18.00, NULL, NULL),
(37, 'Durban Poison', 'normal', 'Sativa', 135.00, '3g', 'Sweet and spicy with energetic effects', 'https://images.pexels.com/photos/7584526/pexels-photo-7584526.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 19.00, NULL, NULL),
(38, 'Bubba Kush', 'normal', 'Indica', 145.00, '3g', 'Coffee and chocolate notes with relaxing effects', 'https://images.pexels.com/photos/7584538/pexels-photo-7584538.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 17.00, NULL, NULL),
(99, 'Purple Punch XL', 'exotic', 'Indica', 215.00, '3g', 'Sweet grape candy flavor with deep relaxation', 'https://images.pexels.com/photos/7584591/pexels-photo-7584591.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 1, 24.00, 0.50, 'WEEKLY_SPECIAL'),
(100, 'Durban Poison Premium', 'greenhouse', 'Sativa', 165.00, '3g', 'Sweet and spicy with energetic effects', 'https://images.pexels.com/photos/7584526/pexels-photo-7584526.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 21.00, 0.10, NULL),
(101, 'Granddaddy Purple Kush', 'indoor', 'Indica', 195.00, '3g', 'Sweet grape with deep physical relaxation', 'https://images.pexels.com/photos/7584538/pexels-photo-7584538.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 23.00, 0.20, NULL),
(102, 'Pineapple Express Deluxe', 'normal', 'Hybrid', 145.00, '3g', 'Tropical fruit aroma with energetic effects', 'https://images.pexels.com/photos/7584544/pexels-photo-7584544.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 19.00, 0.30, NULL),
(103, 'Girl Scout Cookies Platinum', 'exotic', 'Hybrid', 220.00, '3g', 'Sweet and earthy with euphoric effects', 'https://images.pexels.com/photos/7584553/pexels-photo-7584553.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 1, 28.00, 0.40, 'PREMIUM'),
(104, 'White Widow Premium', 'indoor', 'Hybrid', 160.00, '3g', 'Earthy pine with balanced effects', 'https://images.pexels.com/photos/7584559/pexels-photo-7584559.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 20.00, 0.50, NULL),
(105, 'AK-47 Gold', 'indoor', 'Hybrid', 185.00, '3g', 'Earthy and floral with uplifting effects', 'https://images.pexels.com/photos/7584562/pexels-photo-7584562.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 22.00, 0.30, NULL),
(106, 'Sour Diesel Premium', 'exotic', 'Sativa', 205.00, '3g', 'Diesel aroma with energetic effects', 'https://images.pexels.com/photos/7584567/pexels-photo-7584567.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 26.00, 0.20, NULL),
(107, 'OG Kush Premium', 'exotic', 'Hybrid', 190.00, '3g', 'Earthy pine with relaxing effects', 'https://images.pexels.com/photos/7584571/pexels-photo-7584571.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 24.00, 0.10, NULL),
(108, 'Cannatonic Plus', 'medical', 'Hybrid', 180.00, '3g', 'Earthy flavor with balanced CBD:THC', 'https://images.pexels.com/photos/7584582/pexels-photo-7584582.jpeg', 'WITBANK', '2025-03-11 12:19:53', 0, 6.00, 12.00, NULL),
(109, 'Skywalker OG Premium', 'indoor', 'Indica', 195.00, '3g', 'Spicy herbal notes with relaxing effects', 'https://images.pexels.com/photos/7584591/pexels-photo-7584591.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 26.00, 0.30, NULL),
(110, 'Trainwreck Premium', 'greenhouse', 'Sativa', 170.00, '3g', 'Pine and lemon with energetic effects', 'https://images.pexels.com/photos/7584526/pexels-photo-7584526.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 21.00, 0.20, NULL),
(111, 'Bubba Kush Premium', 'indoor', 'Indica', 185.00, '3g', 'Coffee and chocolate with relaxing effects', 'https://images.pexels.com/photos/7584538/pexels-photo-7584538.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 22.00, 0.10, NULL),
(112, 'Jack Frost Premium', 'exotic', 'Hybrid', 210.00, '3g', 'Sweet citrus with uplifting effects', 'https://images.pexels.com/photos/7584544/pexels-photo-7584544.jpeg', 'WITBANK', '2025-03-11 12:19:52', 1, 23.00, 0.40, 'LIMITED_EDITION'),
(113, 'Ringo\'s Gift Plus', 'medical', 'Hybrid', 175.00, '3g', 'Earthy with high CBD content', 'https://images.pexels.com/photos/7584553/pexels-photo-7584553.jpeg', 'DULLSTROOM', '2025-03-11 12:19:53', 0, 1.50, 15.00, NULL),
(114, 'Chemdawg Premium', 'indoor', 'Hybrid', 190.00, '3g', 'Diesel and chemical with potent effects', 'https://images.pexels.com/photos/7584559/pexels-photo-7584559.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 25.00, 0.20, NULL),
(115, 'Amnesia Haze Premium', 'greenhouse', 'Sativa', 165.00, '3g', 'Citrus and earthy with energetic effects', 'https://images.pexels.com/photos/7584562/pexels-photo-7584562.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 22.00, 0.10, NULL),
(116, 'Gorilla Glue #4 Premium', 'extract', 'Hybrid', 290.00, '1g', 'Potent concentrate with earthy aroma', 'https://images.pexels.com/photos/7584567/pexels-photo-7584567.jpeg', 'WITBANK', '2025-03-11 12:19:53', 0, 88.00, 0.50, NULL),
(117, 'Blueberry Kush Premium', 'normal', 'Indica', 135.00, '3g', 'Sweet berry with relaxing effects', 'https://images.pexels.com/photos/7584571/pexels-photo-7584571.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 18.00, 0.30, NULL),
(118, 'Strawberry Cough Premium', 'greenhouse', 'Sativa', 155.00, '3g', 'Sweet strawberry with uplifting effects', 'https://images.pexels.com/photos/7584582/pexels-photo-7584582.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 20.00, 0.20, NULL),
(119, 'Mango Kush Premium', 'normal', 'Indica', 140.00, '3g', 'Tropical mango with relaxing effects', 'https://images.pexels.com/photos/7584591/pexels-photo-7584591.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 17.00, 0.10, NULL),
(120, 'Super Lemon Haze Premium', 'greenhouse', 'Sativa', 160.00, '3g', 'Citrus lemon with energetic effects', 'https://images.pexels.com/photos/7584526/pexels-photo-7584526.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 21.00, 0.30, NULL),
(121, 'Cookies and Cream Premium', 'exotic', 'Hybrid', 215.00, '3g', 'Sweet vanilla with balanced effects', 'https://images.pexels.com/photos/7584538/pexels-photo-7584538.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 1, 26.00, 0.20, 'CUSTOMER_FAVORITE'),
(122, 'Grape Ape Premium', 'indoor', 'Indica', 180.00, '3g', 'Sweet grape with relaxing effects', 'https://images.pexels.com/photos/7584544/pexels-photo-7584544.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 23.00, 0.10, NULL),
(123, 'Tangie Premium', 'greenhouse', 'Sativa', 165.00, '3g', 'Citrus tangerine with uplifting effects', 'https://images.pexels.com/photos/7584553/pexels-photo-7584553.jpeg', 'DULLSTROOM', '2025-03-11 12:19:52', 0, 22.00, 0.20, NULL),
(124, 'Pineapple Kush Premium', 'normal', 'Hybrid', 145.00, '3g', 'Tropical pineapple with balanced effects', 'https://images.pexels.com/photos/7584559/pexels-photo-7584559.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 19.00, 0.30, NULL),
(125, 'Lemon OG Premium', 'extract', 'Hybrid', 310.00, '1g', 'Citrus terpene-rich concentrate', 'https://images.pexels.com/photos/7584562/pexels-photo-7584562.jpeg', 'DULLSTROOM', '2025-03-11 12:19:53', 0, 86.00, 0.40, NULL),
(126, 'Sunset Sherbet Premium', 'exotic', 'Hybrid', 200.00, '3g', 'Sweet berry with relaxing effects', 'https://images.pexels.com/photos/7584567/pexels-photo-7584567.jpeg', 'WITBANK', '2025-03-11 12:19:52', 0, 24.00, 0.20, NULL),
(127, 'Harle-Tsu Premium', 'medical', 'Hybrid', 170.00, '3g', 'Earthy with high CBD content', 'https://images.pexels.com/photos/7584571/pexels-photo-7584571.jpeg', 'DULLSTROOM', '2025-03-11 12:19:53', 0, 1.00, 18.00, NULL),
(128, 'Mimosa Premium', 'exotic', 'Hybrid', 205.00, '3g', 'Citrus and tropical with uplifting effects', 'https://images.pexels.com/photos/7584582/pexels-photo-7584582.jpeg', 'WITBANK', '2025-03-11 12:19:52', 1, 25.00, 0.10, 'NEW_ARRIVAL');

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
(1, '9504091575088', 'Doc', 'Dev', NULL, 'dev.doc@outlook.com', '0833899659', '3 De Waal\nModelpark\nEmalahleni\n1034', '$2b$10$/ebHcobc/kUe8yJuVq10ZOUlJgvedkns81ucrytYF6LB9pPW1m5.y', 'CP001', '2025-03-27 16:22:37', 'ACTIVE', 'ACTIVE', '2025-04-01 14:11:12', '2025-03-27 16:21:50', '2025-04-01 14:11:12', NULL, NULL, NULL, NULL, NULL, 0, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', 0, NULL, NULL, 'GOLD', '2025-03-27 16:21:50', 0, 90, '2025-03-27 16:21:50', '2025-03-27 16:21:50', 'ACTIVE', NULL, 0);

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
(1, 1, 'REGISTRATION', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"email\":\"dev.doc@outlook.com\",\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-27 16:21:50'),
(2, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-27 16:24:09'),
(3, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-27 17:27:06'),
(4, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-27 17:27:06'),
(5, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-27 18:23:03'),
(6, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-27 18:29:40'),
(7, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-27 18:29:49'),
(8, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-27 22:27:02'),
(9, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-27 22:31:06'),
(10, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-27 22:40:58'),
(11, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-27 22:40:58'),
(12, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\"}', '2025-03-28 05:21:34'),
(13, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-28 09:05:30'),
(14, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36\"}', '2025-03-28 09:22:23'),
(15, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36\"}', '2025-03-28 09:22:23'),
(16, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36\"}', '2025-03-28 09:22:23'),
(17, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36\"}', '2025-03-28 09:22:24'),
(18, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-28 10:20:57'),
(19, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36\"}', '2025-03-28 10:31:43'),
(20, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-28 11:45:09'),
(21, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36\"}', '2025-03-28 11:55:10'),
(22, 1, 'LOGOUT', '::ffff:127.0.0.1', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36\"}', '2025-03-28 11:55:10'),
(23, 1, 'LOGIN', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-31 15:33:29'),
(24, 1, 'LOGOUT', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\"}', '2025-03-31 15:50:15'),
(25, 1, 'LOGOUT', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\"}', '2025-03-31 15:50:15'),
(26, 1, 'LOGOUT', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\"}', '2025-03-31 15:50:15'),
(27, 1, 'LOGOUT', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\"}', '2025-03-31 15:50:15'),
(28, 1, 'LOGIN', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\",\"referrer\":\"http://localhost:3000/\"}', '2025-03-31 16:30:38'),
(29, 1, 'LOGOUT', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\"}', '2025-04-01 02:41:00'),
(30, 1, 'LOGOUT', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\"}', '2025-04-01 02:41:01'),
(31, 1, 'LOGIN', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '{\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0\",\"referrer\":\"http://localhost:3000/\"}', '2025-04-01 04:35:42'),
(32, 1, 'LOGIN', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\",\"referrer\":\"http://localhost:3000/\"}', '2025-04-01 10:03:32'),
(33, 1, 'LOGIN', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\",\"referrer\":\"http://localhost:3000/\"}', '2025-04-01 10:03:38'),
(34, 1, 'LOGIN', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\",\"referrer\":\"http://localhost:3000/\"}', '2025-04-01 10:40:42'),
(35, 1, 'LOGIN', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\",\"referrer\":\"http://localhost:3000/\"}', '2025-04-01 10:57:30'),
(36, 1, 'LOGIN', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '{\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36\",\"referrer\":\"http://localhost:3000/\"}', '2025-04-01 14:11:13');

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
(1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzA5MjY0OSwiZXhwIjoxNzQzNjk3NDQ5fQ.JsG1YLSQ3MWSlmt6ttvSZ6AnviOiA5kstfm40QH3LLg', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-27 16:24:09', '2025-04-03 16:24:09', 0),
(2, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzA5OTc4MiwiZXhwIjoxNzQzNzA0NTgyfQ.0d2c5ZkklZMGj5IrL4SwgSqmYv6XbWs12TLGHkeEVGA', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-27 18:23:02', '2025-04-03 18:23:02', 0),
(3, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzEwMDE4OSwiZXhwIjoxNzQzNzA0OTg5fQ.n340mfDVd6lepkgl9rOXVPqBxZQXdvkdXQN5drAgl9U', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-27 18:29:49', '2025-04-03 18:29:49', 1),
(4, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzExNDQyMSwiZXhwIjoxNzQzNzE5MjIxfQ.MDAhPHREB3_Onk1pzHISKSxYkyvcNmmWOWGUVa6qCAA', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-27 22:27:01', '2025-04-03 22:27:01', 0),
(5, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzExNDY2NSwiZXhwIjoxNzQzNzE5NDY1fQ.4acdlcgjhCuEXmMWSl9rd1AsVGMtGS4rWHq7H7tEN9Q', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-03-27 22:31:05', '2025-04-03 22:31:05', 0),
(6, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzE1MjcyOSwiZXhwIjoxNzQzNzU3NTI5fQ.rqOleHhvDFRXGWF5puqxM2wen8YCSuRpQACAWER9t0E', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '::ffff:127.0.0.1', '2025-03-28 09:05:29', '2025-04-04 09:05:29', 0),
(7, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzE1NzI1NywiZXhwIjoxNzQzNzYyMDU3fQ.i8baKsShKuc00-JDOfsvC8BdAUJIKsxc25X9xdRO6WY', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '::ffff:127.0.0.1', '2025-03-28 10:20:57', '2025-04-04 10:20:57', 0),
(8, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzE2MjMwOCwiZXhwIjoxNzQzNzY3MTA4fQ.UoEMP9dh43hj-Ffbi3nfVtDD8M07h1sO0HigcQ3ZoE0', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36', '::ffff:127.0.0.1', '2025-03-28 11:45:08', '2025-04-04 11:45:08', 0),
(9, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzQzNTIwOCwiZXhwIjoxNzQ0MDQwMDA4fQ.TE_1_xSK7GyTPav7sGmGF99Uq-y5YIPbIn5bl-534T0', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '::1', '2025-03-31 15:33:28', '2025-04-07 15:33:28', 0),
(10, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzQzODYzNywiZXhwIjoxNzQ0MDQzNDM3fQ.0WSNC3_dIytQU_KYgS8kadayXHtxEWFYfiuNU2xcis8', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '::1', '2025-03-31 16:30:37', '2025-04-07 16:30:37', 0),
(11, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzQ4MjE0MiwiZXhwIjoxNzQzNDgyNzQ2fQ.hfPY41TiX2oDrUIShT07TfOCveEFpnjhIhcBOyCofkw', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', '::ffff:127.0.0.1', '2025-04-01 04:35:42', '2025-04-08 04:35:42', 1),
(12, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzUwMTgxMiwiZXhwIjoxNzQzNTAyNDE2fQ.ThY1f60VC3Bbo-TBhfNqgHySONpxEOnxU5lYDkrrxBU', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '::1', '2025-04-01 10:03:32', '2025-04-08 10:03:32', 1),
(13, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzUwMTgxNywiZXhwIjoxNzQzNTAyNDIxfQ.6fFL2xb-FJXpT4wEUc9dlybXnV0eaNUGjAns1Ni8Rlo', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '::1', '2025-04-01 10:03:37', '2025-04-08 10:03:37', 1),
(14, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzUwNDA0MSwiZXhwIjoxNzQzNTA0NjQ1fQ.ndcIOtvLJHTZWz167IV_LEN0_HLoEjl1EpZlzMRHy8o', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '::1', '2025-04-01 10:40:41', '2025-04-08 10:40:41', 1),
(15, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzUwNTA1MCwiZXhwIjoxNzQzNTA1NjU0fQ.Zi6yx2RnrNnki3hBSNuNJgybQ-6wDSIGLO5ciIVHTZ4', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '::1', '2025-04-01 10:57:30', '2025-04-08 10:57:30', 1),
(16, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVmVyc2lvbiI6MCwidG9rZW5UeXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MzUxNjY3MywiZXhwIjoxNzQzNTE3Mjc3fQ.QDaIj5J2hT56HnKbwY-cnv-icr2Tpt1A5zVf9OFSDDA', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36', '::1', '2025-04-01 14:11:13', '2025-04-08 14:11:13', 1);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `strains`
--
ALTER TABLE `strains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

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
