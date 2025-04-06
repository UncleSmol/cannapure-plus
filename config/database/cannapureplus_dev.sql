-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 25, 2025 at 09:29 PM
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
-- Table structure for table `csrf_tokens`
--

CREATE TABLE `csrf_tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_used` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `edibles`
--

CREATE TABLE `edibles` (
  `id` int(11) NOT NULL,
  `strain_name` varchar(255) NOT NULL,
  `strain_type` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `measurement` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `store_location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `edibles`
--

INSERT INTO `edibles` (`id`, `strain_name`, `strain_type`, `price`, `measurement`, `description`, `image_url`, `store_location`, `created_at`) VALUES
(1, 'Chocolate Brownie', 'Baked Good', 150.00, '1 piece', 'Rich cannabis-infused chocolate treat.', 'choco_brownie.jpg', 'WITBANK', '2025-02-14 22:38:32'),
(2, 'Gummy Bears', 'Gummies', 130.00, '10 pieces', 'Delicious fruity gummies infused with THC.', 'gummy_bears.jpg', 'DULLSTROOM', '2025-02-14 22:38:32'),
(3, 'Lemon Cake', 'Baked Good', 160.00, '1 slice', 'Zesty lemon cake with uplifting effects.', 'lemon_cake.jpg', 'WITBANK', '2025-02-14 22:38:32'),
(4, 'Canna Cookies', 'Cookies', 140.00, '5 cookies', 'Crispy cookies infused with a balanced hybrid.', 'canna_cookies.jpg', 'DULLSTROOM', '2025-02-14 22:38:32'),
(5, 'Mint Choco Bites', 'Chocolate', 180.00, '3 pieces', 'Refreshing mint chocolate with a relaxing high.', 'mint_choco_bites.jpg', 'WITBANK', '2025-02-14 22:38:32'),
(6, 'Berry Delight Bar', 'Chocolate', 170.00, '1 bar', 'Berry-flavored cannabis chocolate bar.', 'berry_delight_bar.jpg', 'DULLSTROOM', '2025-02-14 22:38:32'),
(7, 'Honey Infused Tea', 'Tea', 190.00, '1 pack', 'Soothing honey-infused THC tea bags.', 'honey_tea.jpg', 'WITBANK', '2025-02-14 22:38:32'),
(8, 'Coconut Bliss Bites', 'Chocolate', 175.00, '3 pieces', 'Coconut-flavored THC-infused treats.', 'coconut_bliss.jpg', 'DULLSTROOM', '2025-02-14 22:38:32'),
(9, 'Mango THC Drink', 'Beverage', 200.00, '1 bottle', 'Refreshing mango beverage with an energetic boost.', 'mango_thc_drink.jpg', 'WITBANK', '2025-02-14 22:38:32'),
(10, 'Chewy Caramel Edibles', 'Caramel', 185.00, '4 pieces', 'Soft caramel candies with a smooth THC experience.', 'chewy_caramel.jpg', 'DULLSTROOM', '2025-02-14 22:38:32');

-- --------------------------------------------------------

--
-- Table structure for table `exotic_tunnel_strains`
--

CREATE TABLE `exotic_tunnel_strains` (
  `id` int(11) NOT NULL,
  `strain_name` varchar(255) NOT NULL,
  `strain_type` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `measurement` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `store_location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exotic_tunnel_strains`
--

INSERT INTO `exotic_tunnel_strains` (`id`, `strain_name`, `strain_type`, `price`, `measurement`, `description`, `image_url`, `store_location`, `created_at`) VALUES
(1, 'Purple Rain', 'Hybrid', 200.00, '3g', 'Smooth blend of tropical and berry flavors.', 'purple_rain.jpg', 'WITBANK, DULLSTROOM', '2025-02-14 22:35:24'),
(2, 'Alien Fuel', 'Indica', 225.00, '4g', 'Heavy body effects, perfect for night use.', 'alien_fuel.jpg', 'DULLSTROOM', '2025-02-14 22:35:24'),
(3, 'Golden Nugget', 'Sativa', 190.00, '2g', 'Energizing strain with golden pistils.', 'golden_nugget.jpg', 'WITBANK', '2025-02-14 22:35:24'),
(4, 'Nebula Frost', 'Hybrid', 215.00, '5g', 'Spacey high with cool minty undertones.', 'nebula_frost.jpg', 'DULLSTROOM', '2025-02-14 22:35:24'),
(5, 'Royal OG', 'Indica', 240.00, '3g', 'Strong Indica, perfect for deep relaxation.', 'royal_og.jpg', 'WITBANK', '2025-02-14 22:35:24'),
(6, 'Starburst Haze', 'Sativa', 195.00, '4g', 'Bright citrus flavor with an uplifting high.', 'starburst_haze.jpg', 'DULLSTROOM', '2025-02-14 22:35:24'),
(7, 'Venom Kush', 'Hybrid', 210.00, '3g', 'Balanced hybrid with intense potency.', 'venom_kush.jpg', 'WITBANK', '2025-02-14 22:35:24'),
(8, 'Skywalker Dream', 'Indica', 230.00, '5g', 'Deep sleep strain with a berry finish.', 'skywalker_dream.jpg', 'DULLSTROOM', '2025-02-14 22:35:24'),
(9, 'Galactic Punch', 'Sativa', 205.00, '2g', 'Powerful head high with an energetic boost.', 'galactic_punch.jpg', 'WITBANK', '2025-02-14 22:35:24'),
(10, 'Forbidden Fruit', 'Hybrid', 220.00, '4g', 'Rich fruity flavors with a relaxing effect.', 'forbidden_fruit.jpg', 'DULLSTROOM', '2025-02-14 22:35:24');

-- --------------------------------------------------------

--
-- Table structure for table `extracts_vapes`
--

CREATE TABLE `extracts_vapes` (
  `id` int(11) NOT NULL,
  `strain_name` varchar(255) NOT NULL,
  `strain_type` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `measurement` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `store_location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `extracts_vapes`
--

INSERT INTO `extracts_vapes` (`id`, `strain_name`, `strain_type`, `price`, `measurement`, `description`, `image_url`, `store_location`, `created_at`) VALUES
(1, 'Pure Gold Wax', 'Concentrate', 300.00, '1g', 'High-potency wax with citrus undertones.', 'pure_gold_wax.jpg', 'WITBANK', '2025-02-14 22:38:19'),
(2, 'Crystal Shatter', 'Shatter', 320.00, '1g', 'Smooth and potent shatter for relaxation.', 'crystal_shatter.jpg', 'DULLSTROOM', '2025-02-14 22:38:19'),
(3, 'Electric Vape', 'Vape Cartridge', 280.00, '0.5g', 'Energizing vape cartridge with fruity flavors.', 'electric_vape.jpg', 'WITBANK', '2025-02-14 22:38:19'),
(4, 'Honey Dab', 'Live Resin', 290.00, '1g', 'Golden honey-infused dab with a balanced high.', 'honey_dab.jpg', 'DULLSTROOM', '2025-02-14 22:38:19'),
(5, 'Midnight Oil', 'THC Distillate', 340.00, '2g', 'Perfect for deep sleep and long-lasting effects.', 'midnight_oil.jpg', 'WITBANK', '2025-02-14 22:38:19'),
(6, 'Lemon Haze Vape', 'Vape Cartridge', 275.00, '0.5g', 'Citrus-flavored vape with an uplifting high.', 'lemon_haze_vape.jpg', 'DULLSTROOM', '2025-02-14 22:38:19'),
(7, 'Fire Resin', 'Live Resin', 310.00, '1g', 'Live resin extract with smooth consistency.', 'fire_resin.jpg', 'WITBANK', '2025-02-14 22:38:19'),
(8, 'Cloud Nine Wax', 'Wax', 330.00, '2g', 'Highly potent wax for instant cerebral effects.', 'cloud_nine_wax.jpg', 'DULLSTROOM', '2025-02-14 22:38:19'),
(9, 'Berry Bliss Vape', 'Vape Cartridge', 295.00, '0.5g', 'Berry-flavored vape cartridge for relaxation.', 'berry_bliss_vape.jpg', 'WITBANK', '2025-02-14 22:38:19'),
(10, 'Neon Haze Shatter', 'Shatter', 315.00, '1.5g', 'Tropical-flavored shatter with a smooth hit.', 'neon_haze_shatter.jpg', 'DULLSTROOM', '2025-02-14 22:38:19');

-- --------------------------------------------------------

--
-- Table structure for table `greenhouse_strains`
--

CREATE TABLE `greenhouse_strains` (
  `id` int(11) NOT NULL,
  `strain_name` varchar(255) NOT NULL,
  `strain_type` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `measurement` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `store_location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `greenhouse_strains`
--

INSERT INTO `greenhouse_strains` (`id`, `strain_name`, `strain_type`, `price`, `measurement`, `description`, `image_url`, `store_location`, `created_at`) VALUES
(1, 'Green Thunder', 'Hybrid', 140.00, '3g', 'Energizing hybrid with earthy notes.', 'green_thunder.jpg', 'WITBANK', '2025-02-14 22:34:34'),
(2, 'Sunset Bliss', 'Indica', 160.00, '4g', 'Relaxing strain with tropical hints.', 'sunset_bliss.jpg', 'DULLSTROOM', '2025-02-14 22:34:34'),
(3, 'Citrus Punch', 'Sativa', 135.00, '2g', 'Packed with citrus flavors and a strong high.', 'citrus_punch.jpg', 'WITBANK', '2025-02-14 22:34:34'),
(4, 'Frosted Fire', 'Hybrid', 175.00, '5g', 'Frosty buds with a spicy undertone.', 'frosted_fire.jpg', 'DULLSTROOM', '2025-02-14 22:34:34'),
(5, 'Jungle Haze', 'Sativa', 125.00, '3g', 'Tropical flavors with a cerebral high.', 'jungle_haze.jpg', 'WITBANK', '2025-02-14 22:34:34'),
(6, 'Mystic Dream', 'Indica', 155.00, '4g', 'Full-body relaxation, floral aroma.', 'mystic_dream.jpg', 'DULLSTROOM', '2025-02-14 22:34:34'),
(7, 'Hazy Delight', 'Hybrid', 165.00, '3g', 'Balanced effects for all-day use.', 'hazy_delight.jpg', 'WITBANK', '2025-02-14 22:34:34'),
(8, 'Amber Sky', 'Sativa', 145.00, '5g', 'Mellow head high, smooth smoke.', 'amber_sky.jpg', 'DULLSTROOM', '2025-02-14 22:34:34'),
(9, 'Dark Essence', 'Indica', 175.00, '2g', 'Heavy-hitting Indica, perfect for nighttime.', 'dark_essence.jpg', 'WITBANK', '2025-02-14 22:34:34'),
(10, 'Tropic Thunder', 'Hybrid', 135.00, '4g', 'Strong citrus aroma, uplifting effects.', 'tropic_thunder.jpg', 'DULLSTROOM', '2025-02-14 22:34:34');

-- --------------------------------------------------------

--
-- Table structure for table `indoor_strains`
--

CREATE TABLE `indoor_strains` (
  `id` int(11) NOT NULL,
  `strain_name` varchar(255) NOT NULL,
  `strain_type` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `measurement` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `store_location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `indoor_strains`
--

INSERT INTO `indoor_strains` (`id`, `strain_name`, `strain_type`, `price`, `measurement`, `description`, `image_url`, `store_location`, `created_at`) VALUES
(1, 'Blueberry Kush', 'Indica', 210.00, '3g', 'Sweet blueberry aroma with deep relaxation effects.', 'blueberry_kush.jpg', 'WITBANK', '2025-02-14 22:35:40'),
(2, 'Skywalker OG', 'Hybrid', 220.00, '4g', 'Powerful hybrid with a spicy citrus punch.', 'skywalker_og.jpg', 'DULLSTROOM', '2025-02-14 22:35:40'),
(3, 'Frostbite', 'Sativa', 200.00, '2g', 'Energizing indoor strain with a crisp menthol finish.', 'frostbite.jpg', 'WITBANK', '2025-02-14 22:35:40'),
(4, 'Purple Eclipse', 'Indica', 240.00, '5g', 'Deep relaxation with fruity undertones.', 'purple_eclipse.jpg', 'DULLSTROOM', '2025-02-14 22:35:40'),
(5, 'Velvet Dream', 'Hybrid', 225.00, '3g', 'Smooth hybrid with balanced effects.', 'velvet_dream.jpg', 'WITBANK', '2025-02-14 22:35:40'),
(6, 'Emerald Blaze', 'Sativa', 195.00, '4g', 'Strong head high with a citrusy aftertaste.', 'emerald_blaze.jpg', 'DULLSTROOM', '2025-02-14 22:35:40'),
(7, 'Silver Mist', 'Hybrid', 205.00, '3g', 'Unique spicy flavor with a mellow high.', 'silver_mist.jpg', 'WITBANK', '2025-02-14 22:35:40'),
(8, 'Dark Phantom', 'Indica', 230.00, '5g', 'Heavy sedative effects, perfect for nighttime.', 'dark_phantom.jpg', 'DULLSTROOM', '2025-02-14 22:35:40'),
(9, 'Fire OG', 'Sativa', 215.00, '2g', 'Fiery citrus punch with long-lasting effects.', 'fire_og.jpg', 'WITBANK', '2025-02-14 22:35:40'),
(10, 'Golden Nectar', 'Hybrid', 225.00, '4g', 'Smooth, golden buds with a strong aroma.', 'golden_nectar.jpg', 'DULLSTROOM', '2025-02-14 22:35:40');

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

-- --------------------------------------------------------

--
-- Table structure for table `medical_strains`
--

CREATE TABLE `medical_strains` (
  `id` int(11) NOT NULL,
  `strain_name` varchar(255) NOT NULL,
  `strain_type` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `measurement` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `store_location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_strains`
--

INSERT INTO `medical_strains` (`id`, `strain_name`, `strain_type`, `price`, `measurement`, `description`, `image_url`, `store_location`, `created_at`) VALUES
(1, 'CBD Relief', 'Hybrid', 180.00, '3g', 'High CBD content, great for pain relief.', 'cbd_relief.jpg', 'WITBANK', '2025-02-14 22:35:52'),
(2, 'Pain-Free OG', 'Indica', 200.00, '4g', 'Perfect for chronic pain and sleep support.', 'pain_free_og.jpg', 'DULLSTROOM', '2025-02-14 22:35:52'),
(3, 'Calm Mind', 'Sativa', 190.00, '2g', 'Designed to reduce anxiety and boost focus.', 'calm_mind.jpg', 'WITBANK', '2025-02-14 22:35:52'),
(4, 'Therapy Haze', 'Hybrid', 220.00, '5g', 'Full-body relaxation with mental clarity.', 'therapy_haze.jpg', 'DULLSTROOM', '2025-02-14 22:35:52'),
(5, 'Healing Touch', 'Indica', 195.00, '3g', 'Strong sedative effects, great for deep sleep.', 'healing_touch.jpg', 'WITBANK', '2025-02-14 22:35:52'),
(6, 'Energy Boost', 'Sativa', 185.00, '4g', 'Boosts energy without paranoia.', 'energy_boost.jpg', 'DULLSTROOM', '2025-02-14 22:35:52'),
(7, 'Golden Remedy', 'Hybrid', 210.00, '3g', 'Pain relief with mild euphoria.', 'golden_remedy.jpg', 'WITBANK', '2025-02-14 22:35:52'),
(8, 'CBD Balance', 'Indica', 230.00, '5g', 'Balanced CBD:THC ratio for mild effects.', 'cbd_balance.jpg', 'DULLSTROOM', '2025-02-14 22:35:52'),
(9, 'Relaxing Green', 'Hybrid', 215.00, '2g', 'Ideal for stress management.', 'relaxing_green.jpg', 'WITBANK', '2025-02-14 22:35:52'),
(10, 'Soothing Sunset', 'Sativa', 225.00, '4g', 'Light high with anti-inflammatory benefits.', 'soothing_sunset.jpg', 'DULLSTROOM', '2025-02-14 22:35:52');

-- --------------------------------------------------------

--
-- Table structure for table `normal_strains`
--

CREATE TABLE `normal_strains` (
  `id` int(11) NOT NULL,
  `strain_name` varchar(255) NOT NULL,
  `strain_type` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `measurement` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `store_location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `normal_strains`
--

INSERT INTO `normal_strains` (`id`, `strain_name`, `strain_type`, `price`, `measurement`, `description`, `image_url`, `store_location`, `created_at`) VALUES
(1, 'Relax OG', 'Indica', 120.00, '5g', 'A smooth, laid-back strain for deep relaxation.', 'relax_og.jpg', 'WITBANK', '2025-02-14 22:34:22'),
(2, 'Daydream Haze', 'Sativa', 150.00, '3g', 'Gives a light euphoric high perfect for socializing.', 'daydream_haze.jpg', 'DULLSTROOM', '2025-02-14 22:34:22'),
(3, 'Chill Mode', 'Hybrid', 130.00, '5g', 'Balanced hybrid with smooth taste and effects.', 'chill_mode.jpg', 'WITBANK', '2025-02-14 22:34:22'),
(4, 'Cloud Nine', 'Sativa', 170.00, '2g', 'Super uplifting and energetic.', 'cloud_nine.jpg', 'DULLSTROOM', '2025-02-14 22:34:22'),
(5, 'Couch Lock', 'Indica', 190.00, '3g', 'Strong Indica for deep sleep.', 'couch_lock.jpg', 'WITBANK', '2025-02-14 22:34:22'),
(6, 'Sweet Serenity', 'Hybrid', 140.00, '4g', 'Perfect for creative relaxation.', 'sweet_serenity.jpg', 'DULLSTROOM', '2025-02-14 22:34:22'),
(7, 'Zesty Kush', 'Sativa', 125.00, '2g', 'Citrus-flavored sativa, energetic high.', 'zesty_kush.jpg', 'WITBANK', '2025-02-14 22:34:22'),
(8, 'Green Mist', 'Hybrid', 135.00, '5g', 'Light head-high with a fruity taste.', 'green_mist.jpg', 'DULLSTROOM', '2025-02-14 22:34:22'),
(9, 'Golden Hour', 'Sativa', 160.00, '3g', 'Great for morning productivity.', 'golden_hour.jpg', 'WITBANK', '2025-02-14 22:34:22'),
(10, 'Night Rider', 'Indica', 145.00, '4g', 'Powerful Indica, great for unwinding.', 'night_rider.jpg', 'DULLSTROOM', '2025-02-14 22:34:22');

-- --------------------------------------------------------

--
-- Table structure for table `pre_rolled`
--

CREATE TABLE `pre_rolled` (
  `id` int(11) NOT NULL,
  `strain_name` varchar(255) NOT NULL,
  `strain_type` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `measurement` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `store_location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pre_rolled`
--

INSERT INTO `pre_rolled` (`id`, `strain_name`, `strain_type`, `price`, `measurement`, `description`, `image_url`, `store_location`, `created_at`) VALUES
(1, 'Classic Joint', 'Hybrid', 100.00, '1g', 'Pre-rolled joint ready for instant use.', 'classic_joint.jpg', 'WITBANK', '2025-02-14 22:36:10'),
(2, 'Chill Stick', 'Indica', 110.00, '1.5g', 'Smooth and strong, perfect for relaxation.', 'chill_stick.jpg', 'DULLSTROOM', '2025-02-14 22:36:10'),
(3, 'Wake & Bake', 'Sativa', 120.00, '1.2g', 'Perfect for a morning pick-me-up.', 'wake_bake.jpg', 'WITBANK', '2025-02-14 22:36:10'),
(4, 'Double Trouble', 'Hybrid', 130.00, '2g', 'Two-joint combo for a long session.', 'double_trouble.jpg', 'DULLSTROOM', '2025-02-14 22:36:10'),
(5, 'Sunset Roll', 'Indica', 105.00, '1g', 'Perfect for an evening wind-down.', 'sunset_roll.jpg', 'WITBANK', '2025-02-14 22:36:10'),
(6, 'Minty Fresh', 'Hybrid', 115.00, '1.3g', 'Menthol-infused pre-roll.', 'minty_fresh.jpg', 'DULLSTROOM', '2025-02-14 22:36:10'),
(7, 'Lemon Twist', 'Sativa', 125.00, '1.5g', 'Lemon-flavored sativa joint.', 'lemon_twist.jpg', 'WITBANK', '2025-02-14 22:36:10'),
(8, 'Power Punch', 'Indica', 140.00, '2g', 'Hard-hitting, long-lasting effects.', 'power_punch.jpg', 'DULLSTROOM', '2025-02-14 22:36:10'),
(9, 'Berry Blast', 'Hybrid', 135.00, '1.8g', 'Fruity flavors and balanced effects.', 'berry_blast.jpg', 'WITBANK', '2025-02-14 22:36:10'),
(10, 'Mellow Vibes', 'Sativa', 150.00, '2.2g', 'Extra-large pre-roll for a social high.', 'mellow_vibes.jpg', 'DULLSTROOM', '2025-02-14 22:36:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `id_number` varchar(13) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `surname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `residential_address` text NOT NULL,
  `password` varchar(255) NOT NULL,
  `cp_number` varchar(50) DEFAULT NULL,
  `cp_issued_date` timestamp NULL DEFAULT NULL,
  `cp_status` enum('ACTIVE','SUSPENDED','REVOKED') DEFAULT NULL,
  `account_status` enum('PENDING','ACTIVE','SUSPENDED','BANNED') DEFAULT 'PENDING',
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
  `membership_tier` enum('GOLD','DIAMOND','EMERALD','TROPEZ') DEFAULT 'GOLD',
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

INSERT INTO `users` (`id`, `id_number`, `first_name`, `surname`, `email`, `phone`, `residential_address`, `password`, `cp_number`, `cp_issued_date`, `cp_status`, `account_status`, `last_login`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`, `modified_by`, `modification_reason`, `last_login_attempt`, `failed_login_attempts`, `last_login_ip`, `device_fingerprint`, `is_locked`, `lock_reason`, `lock_expires_at`, `membership_tier`, `membership_start_date`, `active_days`, `days_to_next_tier`, `last_active_date`, `tier_updated_at`, `membership_status`, `pause_date`, `total_pause_days`) VALUES
(1, '9504015175088', 'Ntsako', 'Khoza', 'ntsako.khoza@yahoo.com', '072 224 4452', '3 De Waal', '$2b$10$astmR2herfb9eNMbcZ3Wfu6TntxXPWHRtk1t3qCLmuvO2yMAzvBCm', 'CP123456', '2025-02-17 01:16:49', 'ACTIVE', 'ACTIVE', NULL, '2025-02-17 01:13:29', '2025-02-22 14:27:15', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 'GOLD', '2025-02-17 16:05:55', 0, 90, '2025-02-17 16:05:55', '2025-02-17 16:05:55', 'ACTIVE', NULL, 0),
(7, '9504020151700', 'John', 'Doe', 'john@example.com', '0833899659', '5 Bethal \nModel Park\n1034', '$2b$10$x0aq.doXqCWJUVPV9J0zTeJ2tAJLtOQLn/z78KqlBZoAhH0PDD30O', NULL, NULL, NULL, 'PENDING', NULL, '2025-02-22 13:40:55', '2025-02-22 13:40:55', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 'GOLD', '2025-02-22 13:40:55', 0, 90, '2025-02-22 13:40:55', '2025-02-22 13:40:55', 'ACTIVE', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_activity_logs`
--

CREATE TABLE `user_activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `activity_type` enum('LOGIN','LOGOUT','PASSWORD_CHANGE','CP_NUMBER_ASSIGNED','ACCOUNT_UPDATE','SUSPICIOUS_ACTIVITY') NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `device_info` text DEFAULT NULL,
  `activity_details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Table structure for table `weekly_specials`
--

CREATE TABLE `weekly_specials` (
  `id` int(11) NOT NULL,
  `strain_name` varchar(255) NOT NULL,
  `strain_type` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `measurement` varchar(50) DEFAULT '/1g',
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT './assets/img/cannipure-logo.png',
  `store_location` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `category` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `weekly_specials`
--

INSERT INTO `weekly_specials` (`id`, `strain_name`, `strain_type`, `price`, `measurement`, `description`, `image_url`, `store_location`, `created_at`, `updated_at`, `category`) VALUES
(1, 'Blue Dream Haze', 'Hybrid', 280.00, '/1g', 'A balanced hybrid that combines the euphoric energy of Sativa with the relaxing effects of Indica. Sweet berry aroma with smooth effects.', '/assets/img/cannapure-logo.png', 'DULLSTROOM', '2025-02-12 20:32:51', '2025-02-19 17:17:04', ''),
(2, 'Purple Punch', 'Indica', 320.00, '/1g', 'A sweet and sedating Indica-dominant hybrid. Tastes like grape candy, berry, and vanilla with relaxing effects.', './assets/img/cannipure-logo.png', 'DULLSTROOM', '2025-02-12 20:32:51', '2025-02-12 20:32:51', ''),
(3, 'Green Crack', 'Sativa', 290.00, '/1g', 'An energizing Sativa strain with sharp energy and focus. Tropical fruit flavor with mango and pineapple notes.', './assets/img/cannipure-logo.png', 'WITBANK', '2025-02-12 20:32:51', '2025-02-12 20:32:51', ''),
(4, 'Wedding Cake', 'Hybrid', 350.00, '/1g', 'Rich and tangy with earthy and peppery flavors. Simultaneously relaxing and euphoric with full-body effects.', './assets/img/cannipure-logo.png', 'DULLSTROOM', '2025-02-12 20:32:51', '2025-02-12 20:32:51', ''),
(5, 'Northern Lights', 'Indica', 300.00, '/1g', 'Sweet and spicy aromas with a pure Indica experience. Deeply relaxing with a dreamy euphoria.', './assets/img/cannipure-logo.png', 'WITBANK', '2025-02-12 20:32:51', '2025-02-12 20:32:51', ''),
(6, 'Durban Poison', 'Sativa', 280.00, '/1g', 'Pure South African Sativa with sweet and piney flavors. Energetic and uplifting effects perfect for daytime use.', './assets/img/cannipure-logo.png', 'DULLSTROOM', '2025-02-12 20:32:51', '2025-02-12 20:32:51', ''),
(7, 'Gelato', 'Hybrid', 340.00, '/1g', 'Sweet and creamy with berry and lavender notes. Balanced effects offering relaxation with a euphoric punch.', './assets/img/cannipure-logo.png', 'WITBANK', '2025-02-12 20:32:51', '2025-02-12 20:32:51', ''),
(8, 'GG4', 'Hybrid', 310.00, '/1g', 'Heavy-hitting hybrid with a diesel aroma. Relaxing yet mentally stimulating with long-lasting effects.', './assets/img/cannipure-logo.png', 'DULLSTROOM', '2025-02-12 20:32:51', '2025-02-12 20:32:51', ''),
(9, 'Zkittlez', 'Indica', 330.00, '/1g', 'Tropical fruit flavors with berry undertones. Calming and mood-lifting effects without heavy sedation.', './assets/img/cannipure-logo.png', 'WITBANK', '2025-02-12 20:32:51', '2025-02-12 20:32:51', ''),
(10, 'Jack Herer', 'Sativa', 295.00, '/1g', 'Pine-forward aroma with spicy herbal notes. Clear-headed, creative, and blissful effects.', './assets/img/cannipure-logo.png', 'DULLSTROOM', '2025-02-12 20:32:51', '2025-02-12 20:32:51', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `csrf_tokens`
--
ALTER TABLE `csrf_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_token` (`token`),
  ADD KEY `idx_user_tokens` (`user_id`,`is_used`);

--
-- Indexes for table `edibles`
--
ALTER TABLE `edibles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exotic_tunnel_strains`
--
ALTER TABLE `exotic_tunnel_strains`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `extracts_vapes`
--
ALTER TABLE `extracts_vapes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `greenhouse_strains`
--
ALTER TABLE `greenhouse_strains`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `indoor_strains`
--
ALTER TABLE `indoor_strains`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ip_time` (`ip_address`,`attempt_time`),
  ADD KEY `idx_user_time` (`user_id`,`attempt_time`);

--
-- Indexes for table `medical_strains`
--
ALTER TABLE `medical_strains`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `normal_strains`
--
ALTER TABLE `normal_strains`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pre_rolled`
--
ALTER TABLE `pre_rolled`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_number` (`id_number`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `cp_number` (`cp_number`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_id_number` (`id_number`),
  ADD KEY `idx_cp_number` (`cp_number`),
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
-- Indexes for table `weekly_specials`
--
ALTER TABLE `weekly_specials`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `csrf_tokens`
--
ALTER TABLE `csrf_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `edibles`
--
ALTER TABLE `edibles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `exotic_tunnel_strains`
--
ALTER TABLE `exotic_tunnel_strains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `extracts_vapes`
--
ALTER TABLE `extracts_vapes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `greenhouse_strains`
--
ALTER TABLE `greenhouse_strains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `indoor_strains`
--
ALTER TABLE `indoor_strains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `medical_strains`
--
ALTER TABLE `medical_strains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `normal_strains`
--
ALTER TABLE `normal_strains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `pre_rolled`
--
ALTER TABLE `pre_rolled`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `weekly_specials`
--
ALTER TABLE `weekly_specials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `csrf_tokens`
--
ALTER TABLE `csrf_tokens`
  ADD CONSTRAINT `csrf_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

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
