-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 27, 2025 at 08:52 PM
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

--
-- Indexes for dumped tables
--

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `strains`
--
ALTER TABLE `strains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
