-- Drop existing tables if they exist
DROP TABLE IF EXISTS medical_strains;
DROP TABLE IF EXISTS normal_strains;
DROP TABLE IF EXISTS greenhouse_strains;
DROP TABLE IF EXISTS indoor_strains;
DROP TABLE IF EXISTS exotic_tunnel_strains;

-- Create unified strains table
CREATE TABLE IF NOT EXISTS strains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  strain_name VARCHAR(100) NOT NULL,
  category ENUM('medical', 'normal', 'greenhouse', 'indoor', 'exotic_tunnel') NOT NULL,
  strain_type ENUM('indica', 'sativa', 'hybrid') NOT NULL,
  thc_content DECIMAL(5,2),
  cbd_content DECIMAL(5,2),
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  effects TEXT,
  medical_uses TEXT,
  growing_method VARCHAR(100),
  store_location VARCHAR(100),
  is_special BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Add index for common queries
  INDEX idx_category (category),
  INDEX idx_strain_type (strain_type),
  INDEX idx_thc_content (thc_content),
  INDEX idx_cbd_content (cbd_content),
  INDEX idx_price (price)
);