import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import "./budbar.css";
import StrainCard from "../strain_card/StrainCard";
import TopControls from "./components/TopControls";

const categoryDescriptions = {
  medical: "High-CBD strains and therapeutic cannabis products for wellness and relief",
  edible: "Cannabis-infused treats, snacks and beverages for a delicious experience",
  extract: "Premium concentrates, oils, and refined cannabis products",
  pre_rolled: "Expertly crafted pre-rolled joints ready for enjoyment",
  indoor: "Premium indoor-grown flowers cultivated in controlled environments",
  greenhouse: "Sun-grown cannabis nurtured in optimal greenhouse conditions",
  exotic: "Rare and unique strains for the cannabis connoisseur",
  normal: "Classic, reliable strains beloved by enthusiasts"
};

export default function BudBarPage() {
  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const specialsRef = useRef(null);
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedStore, setSelectedStore] = useState('');
  const [strainsByCategory, setStrainsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toggle category open/close
  const scrollToCategory = (category) => {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      const headerHeight = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-height'));
      const topPadding = 20; // Extra padding below header
      
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight - topPadding;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const toggleCategory = (category) => {
    const isOpening = openCategory !== category;
    setOpenCategory(isOpening ? category : null);
    
    if (isOpening) {
      // Small delay to allow animation to start
      setTimeout(() => scrollToCategory(category), 100);
    }
  };

  // Add handlers for TopControls
  const handleStoreFilter = (store) => {
    setSelectedStore(store);
  };

  // Fetch data function - moved to separate function to reuse
  const fetchStrains = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/strains');
      const data = await response.json();
      
      const categorized = data.reduce((acc, strain) => {
        if (!acc[strain.category]) {
          acc[strain.category] = [];
        }
        acc[strain.category].push({
          id: strain.id,
          name: strain.strain_name,
          type: strain.strain_type,
          price: strain.price,
          description: strain.description,
          image: strain.image_url,
          store_location: strain.store_location,
        });
        return acc;
      }, {});

      setStrainsByCategory(categorized);
      return true;
    } catch (err) {
      console.error('Error fetching strains:', err);
      setError('Failed to load products');
      return false;
    }
  };

  // Modified refresh handler
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await fetchStrains();
    setIsRefreshing(false);
  };

  // Initial data fetch
  useEffect(() => {
    setLoading(true);
    fetchStrains().finally(() => setLoading(false));
  }, []);

  // Filter strains by selected store
  const filterStrainsByStore = (strains) => {
    if (!selectedStore) return []; // Return empty array if no store selected
    return strains.filter(strain => strain.store_location === selectedStore);
  };

  // Get filtered strains for display
  const getFilteredStrains = (category) => {
    return filterStrainsByStore(strainsByCategory[category] || []);
  };

  // Get random strains from filtered results
  const getRandomStrainsFromCategories = () => {
    const allFilteredStrains = Object.values(strainsByCategory)
      .flatMap(strains => filterStrainsByStore(strains));
    
    const shuffled = [...allFilteredStrains].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6); // Get 6 random strains for hot picks
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

  if (loading || isRefreshing) return (
    <div className="loading-overlay">
      <div className="loading-spinner">Refreshing data...</div>
    </div>
  );
  if (error) return <div>Error: {error}</div>;

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

        {selectedStore ? (
          <>
            {/* Hot Picks Section */}
            <div className="weekly_specials_tag" ref={specialsRef}>
              <h2 className="section-title">HOT PICKS</h2>
              <div className="__content-wrapper">
                {getRandomStrainsFromCategories().map(strain => (
                  <StrainCard 
                    key={`hotpick-${strain.id}`} 
                    {...strain} 
                    isSpecial={true}
                  />
                ))}
                <div className="scroll-spacer"></div>
              </div>
            </div>

            {/* Main Categories Section */}
            <h2 className="section-title">BROWSE BY CATEGORY</h2>
            
            {/* Individual Categories */}
            {Object.entries(strainsByCategory).map(([category, _]) => {
              const filteredStrains = getFilteredStrains(category);
              if (filteredStrains.length === 0) return null;

              return (
                <div 
                  id={`category-${category}`}
                  key={category} 
                  className={`category-section ${openCategory === category ? 'open' : 'closed'}`}
                >
                  <h3 
                    className="category-section__heading"
                    onClick={() => toggleCategory(category)}
                  >
                    {category.toUpperCase().replace('_', ' ')}
                    <span className="category-count">
                      ({filteredStrains.length})
                    </span>
                    <div className={`category-section__btn opn-cls-btn ${openCategory === category ? 'open' : ''}`}></div>
                  </h3>

                  <p className="category-section__description">
                    {categoryDescriptions[category]}
                  </p>

                  <div className={`category-section__card-holder ${openCategory === category ? 'visible' : 'hidden'}`}>
                    {filteredStrains.map(strain => (
                      <StrainCard key={strain.id} {...strain} />
                    ))}
                    <div className="scroll-spacer"></div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="store-select-message">
            Please select a store location to view available products
          </div>
        )}
      </div>
    </section>
  );
}