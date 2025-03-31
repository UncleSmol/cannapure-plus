-- Sample data for unified strains table
-- This script inserts sample records into the strains table for different categories

-- Medical strains
INSERT INTO strains (strain_name, category, strain_type, thc_content, cbd_content, price, description, effects, medical_uses, store_location, image_url, is_special) VALUES
('Medical Kush', 'medical', 'indica', 15.5, 5.2, 12.99, 'A powerful medical strain for pain relief', 'Relaxing, Pain relief, Sleep aid', 'Chronic pain, Insomnia, Anxiety', 'North Location', '/images/strains/medical-kush.jpg', FALSE),
('Healing Haze', 'medical', 'sativa', 12.8, 8.5, 14.99, 'Balanced medical strain with high CBD', 'Uplifting, Focus, Mild euphoria', 'Inflammation, Depression, Fatigue', 'South Location', '/images/strains/healing-haze.jpg', TRUE),
('Relief Blend', 'medical', 'hybrid', 14.2, 6.8, 13.50, 'Hybrid strain for balanced relief', 'Balanced, Mood enhancement, Mild sedation', 'Muscle spasms, Nausea, Stress', 'Central Location', '/images/strains/relief-blend.jpg', FALSE),
('CBD Therapy', 'medical', 'indica', 6.5, 12.0, 15.99, 'High CBD strain for therapeutic use', 'Minimal psychoactive effects, Clear-headed relief', 'Epilepsy, Inflammation, Anxiety', 'North Location', '/images/strains/cbd-therapy.jpg', FALSE),
('Medicinal Dream', 'medical', 'hybrid', 18.0, 4.5, 16.50, 'Potent hybrid for strong symptom relief', 'Euphoric, Pain numbing, Relaxation', 'Severe pain, PTSD, Insomnia', 'South Location', '/images/strains/medicinal-dream.jpg', TRUE);

-- Normal strains
INSERT INTO strains (strain_name, category, strain_type, thc_content, cbd_content, price, description, effects, store_location, image_url, is_special) VALUES
('Classic OG', 'normal', 'indica', 22.5, 0.5, 10.99, 'Traditional indica with strong effects', 'Relaxing, Sleepy, Hungry', 'North Location', '/images/strains/classic-og.jpg', FALSE),
('Sour Diesel', 'normal', 'sativa', 24.8, 0.3, 11.99, 'Energetic sativa with citrus notes', 'Energetic, Creative, Uplifting', 'South Location', '/images/strains/sour-diesel.jpg', TRUE),
('Blue Dream', 'normal', 'hybrid', 18.5, 0.2, 9.99, 'Popular hybrid with balanced effects', 'Balanced, Creative, Gentle', 'Central Location', '/images/strains/blue-dream.jpg', FALSE),
('Northern Lights', 'normal', 'indica', 20.0, 0.1, 10.50, 'Classic indica strain for relaxation', 'Deeply relaxing, Sleepy, Peaceful', 'North Location', '/images/strains/northern-lights.jpg', FALSE),
('Green Crack', 'normal', 'sativa', 21.5, 0.2, 12.50, 'Sharp, energetic sativa for daytime use', 'Focused, Energetic, Alert', 'South Location', '/images/strains/green-crack.jpg', TRUE);

-- Greenhouse strains
INSERT INTO strains (strain_name, category, strain_type, thc_content, cbd_content, price, description, effects, growing_method, store_location, image_url, is_special) VALUES
('Greenhouse Kush', 'greenhouse', 'indica', 19.5, 0.8, 9.99, 'Sun-grown indica with rich terpene profile', 'Relaxing, Earthy, Full-bodied', 'Greenhouse', 'North Location', '/images/strains/greenhouse-kush.jpg', FALSE),
('Sunshine Haze', 'greenhouse', 'sativa', 20.8, 0.5, 10.99, 'Bright, flavorful greenhouse sativa', 'Uplifting, Creative, Energetic', 'Greenhouse', 'South Location', '/images/strains/sunshine-haze.jpg', TRUE),
('Eco Hybrid', 'greenhouse', 'hybrid', 17.5, 1.0, 8.99, 'Environmentally friendly hybrid strain', 'Balanced, Smooth, Flavorful', 'Greenhouse', 'Central Location', '/images/strains/eco-hybrid.jpg', FALSE),
('Green House Special', 'greenhouse', 'hybrid', 18.0, 0.7, 9.50, 'Special blend grown in optimal conditions', 'Euphoric, Balanced, Social', 'Greenhouse', 'North Location', '/images/strains/greenhouse-special.jpg', FALSE),
('Sun Grown OG', 'greenhouse', 'indica', 21.0, 0.3, 11.50, 'Classic OG with greenhouse growing benefits', 'Relaxing, Potent, Long-lasting', 'Greenhouse', 'South Location', '/images/strains/sun-grown-og.jpg', TRUE);

-- Indoor strains
INSERT INTO strains (strain_name, category, strain_type, thc_content, cbd_content, price, description, effects, growing_method, store_location, image_url, is_special) VALUES
('Indoor Kush', 'indoor', 'indica', 25.5, 0.3, 14.99, 'Premium indoor-grown indica', 'Deeply relaxing, Potent, Heavy', 'Indoor', 'North Location', '/images/strains/indoor-kush.jpg', FALSE),
('Hydro Haze', 'indoor', 'sativa', 26.8, 0.2, 15.99, 'Hydroponic sativa with maximum potency', 'Intensely energetic, Creative, Euphoric', 'Hydroponic', 'South Location', '/images/strains/hydro-haze.jpg', TRUE),
('Premium Blend', 'indoor', 'hybrid', 24.5, 0.5, 13.99, 'Top-shelf indoor hybrid', 'Perfectly balanced, Flavorful, Smooth', 'Indoor', 'Central Location', '/images/strains/premium-blend.jpg', FALSE),
('Craft Cannabis', 'indoor', 'hybrid', 23.0, 0.4, 14.50, 'Artisanal indoor-grown hybrid', 'Complex, Flavorful, Well-rounded', 'Indoor', 'North Location', '/images/strains/craft-cannabis.jpg', FALSE),
('Indoor Special', 'indoor', 'indica', 27.0, 0.2, 16.50, 'Ultra-premium indoor indica', 'Extremely potent, Long-lasting, Deep relaxation', 'Indoor', 'South Location', '/images/strains/indoor-special.jpg', TRUE);

-- Exotic tunnel strains
INSERT INTO strains (strain_name, category, strain_type, thc_content, cbd_content, price, description, effects, growing_method, store_location, image_url, is_special) VALUES
('Exotic OG', 'exotic_tunnel', 'indica', 28.5, 0.2, 18.99, 'Rare indica grown in specialized conditions', 'Intensely relaxing, Unique terpene profile', 'Exotic Tunnel', 'North Location', '/images/strains/exotic-og.jpg', FALSE),
('Tunnel Vision', 'exotic_tunnel', 'sativa', 29.8, 0.1, 19.99, 'Ultra-potent exotic sativa', 'Powerful cerebral effects, Energizing', 'Exotic Tunnel', 'South Location', '/images/strains/tunnel-vision.jpg', TRUE),
('Rare Hybrid', 'exotic_tunnel', 'hybrid', 27.5, 0.3, 17.99, 'Limited edition exotic hybrid', 'Complex effects, Unique flavor profile', 'Exotic Tunnel', 'Central Location', '/images/strains/rare-hybrid.jpg', FALSE),
('Collector\'s Cut', 'exotic_tunnel', 'hybrid', 26.0, 0.4, 18.50, 'Connoisseur-grade exotic strain', 'Distinctive, Powerful, Complex', 'Exotic Tunnel', 'North Location', '/images/strains/collectors-cut.jpg', FALSE),
('Tunnel Master', 'exotic_tunnel', 'indica', 30.0, 0.1, 21.50, 'Highest potency exotic indica', 'Extremely potent, Unique effects, Collector\'s item', 'Exotic Tunnel', 'South Location', '/images/strains/tunnel-master.jpg', TRUE);