import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import "./budbar.css";
import StrainCard from "../strain_card/StrainCard";
import TopControls from "./components/TopControls";

// Mock data grouped by category
const mockStrainsByCategory = {
  medical: [
    { id: 1, name: "ACDC", type: "Hybrid", price: "170", description: "High CBD strain for pain relief" },
    { id: 2, name: "Harlequin", type: "Sativa", price: "165", description: "Balanced CBD:THC for anxiety" },
    { id: 3, name: "Charlotte's Web", type: "Indica", price: "175", description: "High CBD for therapeutic use" }
  ],
  edible: [
    { id: 22, name: "Chocolate Kush Brownie", type: "Indica", price: "120", description: "Rich chocolate brownie with potent effects" },
    { id: 23, name: "Sour Blue Raspberry Gummies", type: "Hybrid", price: "150", description: "Fruity gummies with balanced effects" },
    { id: 24, name: "Mint Chocolate Chip Cookie", type: "Sativa", price: "130", description: "Refreshing mint cookie with uplifting effects" }
  ],
  extract: [
    { id: 10, name: "Blue Dream Vape", type: "Hybrid", price: "300", description: "Premium distillate cartridge" },
    { id: 11, name: "OG Kush Shatter", type: "Indica", price: "280", description: "Pure concentrate for dabbing" },
    { id: 12, name: "Sour Diesel Live Resin", type: "Sativa", price: "320", description: "Full-spectrum extract" }
  ],
  pre_rolled: [
    { id: 27, name: "Wedding Cake Pre-Roll", type: "Hybrid", price: "80", description: "Premium pre-rolled joint with sweet flavor" },
    { id: 28, name: "Durban Poison Pre-Roll Pack", type: "Sativa", price: "220", description: "Pack of three energizing pre-rolls" },
    { id: 29, name: "Granddaddy Purple King Size", type: "Indica", price: "100", description: "Extra-large pre-roll with relaxing effects" }
  ],
  indoor: [
    { id: 4, name: "Wedding Cake", type: "Hybrid", price: "180", description: "Rich and tangy with relaxing effects" },
    { id: 5, name: "Gelato", type: "Hybrid", price: "190", description: "Sweet and creamy with balanced effects" },
    { id: 6, name: "GG4", type: "Hybrid", price: "185", description: "Diesel aroma with powerful effects" }
  ],
  greenhouse: [
    { id: 13, name: "Lemon Haze", type: "Sativa", price: "150", description: "Citrus flavor with energetic effects" },
    { id: 14, name: "Purple Kush", type: "Indica", price: "160", description: "Sweet grape flavor with deep relaxation" },
    { id: 15, name: "Jack Herer", type: "Sativa", price: "155", description: "Pine-forward aroma with creative effects" }
  ],
  exotic: [
    { id: 7, name: "Zkittlez", type: "Indica", price: "200", description: "Tropical fruit flavor with euphoric effects" },
    { id: 8, name: "Runtz", type: "Hybrid", price: "210", description: "Sweet candy flavor with potent effects" },
    { id: 9, name: "Ice Cream Cake", type: "Indica", price: "205", description: "Creamy vanilla with relaxing effects" }
  ],
  normal: [
    { id: 16, name: "Blue Dream", type: "Hybrid", price: "120", description: "Sweet berry aroma with balanced effects" },
    { id: 17, name: "Green Crack", type: "Sativa", price: "130", description: "Sharp energy and focus with tropical flavor" },
    { id: 18, name: "Northern Lights", type: "Indica", price: "140", description: "Sweet and spicy with relaxing effects" }
  ]
};

// Category descriptions
const categoryDescriptions = {
  medical: "High-CBD strains for therapeutic effects",
  edible: "Cannabis-infused treats and snacks",
  extract: "Concentrated cannabis products",
  pre_rolled: "Ready-to-use pre-rolled joints",
  indoor: "Premium indoor-grown flowers",
  greenhouse: "Sun-grown cannabis varieties",
  exotic: "Rare and unique strains",
  normal: "Classic cannabis varieties"
};

// Updated category display names to match HOT PICKS style
const categoryDisplayNames = {
  medical: "WELLNESS REMEDIES",
  edible: "TASTY TREATS",
  extract: "PURE EXTRACTS",
  pre_rolled: "READY TO ROLL",
  indoor: "PREMIUM CRAFT",
  greenhouse: "SUNSHINE GROWN",
  exotic: "RARE FINDS",
  normal: "CLASSIC HITS"
};

export default function BudBarPage() {
  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const specialsRef = useRef(null);
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedStore, setSelectedStore] = useState('');

  // Toggle category open/close
  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  // Add handlers for TopControls
  const handleStoreFilter = (store) => {
    setSelectedStore(store);
  };

  const handleRefreshData = () => {
    // Will be implemented later with actual data fetching
    console.log("Refreshing data...");
  };

  useEffect(() => {
    gsap.fromTo(
      pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );

    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" }
    );

    gsap.fromTo(
      specialsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: "power2.out" }
    );
  }, []);

  return (
    <section className="bud-bar-page" ref={pageRef}>
      <TopControls
        onStoreFilterChange={handleStoreFilter}
        onRefreshData={handleRefreshData}
      />
      
      <div className="bud-bar-page__content">
        <h1 className="lab-title" ref={titleRef}>THE BUD BAR</h1>
        <p className="lab-description">
          Check out what is hot on the shelves this week!
        </p>
        
        {/* Hot Picks Section */}
        <div className="weekly_specials_tag" ref={specialsRef}>
          <h2 className="section-title">HOT PICKS</h2>
          <div className="__content-wrapper">
            {mockStrainsByCategory.exotic.map(strain => (
              <StrainCard key={strain.id} {...strain} isSpecial={false} />
            ))}
            <div className="scroll-spacer"></div>
          </div>
        </div>

        {/* Main Categories Section */}
        <h2 className="section-title">BROWSE BY CATEGORY</h2>
        
        {/* Individual Categories */}
        {Object.entries(mockStrainsByCategory).map(([category, strains]) => (
          <div 
            key={category}
            className={`category-section ${openCategory === category ? 'open' : 'closed'}`}
          >
            <h3 
              className="category-section__heading"
              onClick={() => toggleCategory(category)}
            >
              {category.toUpperCase().replace('_', ' ')}
              <div className={`category-section__btn opn-cls-btn ${openCategory === category ? 'open' : ''}`}></div>
            </h3>
            
            <p className="category-section__description">
              {categoryDescriptions[category]}
            </p>

            <div className={`category-section__card-holder ${openCategory === category ? 'visible' : 'hidden'}`}>
              {strains.map(strain => (
                <StrainCard key={strain.id} {...strain} />
              ))}
              <div className="scroll-spacer"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}