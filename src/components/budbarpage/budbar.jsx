
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import "./budbar.css";
import { StrainCard } from "../strain_card/StrainCard";
import { fetchAllStrains } from "../strain_card/StrainDataService";
import StoreFilter from '../store_filter/StoreFilter';

const strainCategories = [
  {
    id: "normal_strains",
    title: "NORMAL STRAINS",
    description: "Feeling like kicking it back most of the time? our normal strains in stock are mostly Sativa and will give you that laid-back feel anytime you want it.",
  },
  {
    id: "greenhouse_strains",
    title: "GREENHOUSE STRAINS",
    description: "Our Greenhouse strains are all Citrus punch-packed and Loaded and they will knock you out if not smoked with caution hehe.",
  },
  {
    id: "exotic_tunnel_strains",
    title: "EXOTIC TUNNEL STRAINS",
    description: "Experience our premium selection of exotic strains, carefully cultivated in controlled environments for maximum potency and unique flavors.",
  },
  {
    id: "indoor_strains",
    title: "INDOOR STRAINS",
    description: "Premium indoor-grown strains, meticulously cultivated in controlled environments for consistent quality and superior potency.",
  },
  {
    id: "medical_strains",
    title: "MEDICAL STRAINS",
    description: "Specially selected strains with therapeutic properties, perfect for those seeking relief while maintaining clarity and wellness.",
  },
  {
    id: "pre_rolled",
    title: "PRE-ROLLED",
    description: "Your next Ahh... moment will come from our Ready-On-The-Counter conversation.",
  },
  {
    id: "extracts_vapes",
    title: "EXTRACTS & VAPES",
    description: "There are many ways to kill a cat, we do not know of any, however we do know of a way you could get higher...",
  },
  {
    id: "edibles",
    title: "EDIBLES",
    description: "There is no waiting for the happy hour...it shall find you ahead.",
  }
];

export default function BudBarPage() {
  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const specialsRef = useRef(null);
  const categoriesRef = useRef([]);
  
  const [strainData, setStrainData] = useState({});
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedStore, setSelectedStore] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStrains = async () => {
      const data = await fetchAllStrains();
      console.log('Data received in budbar:', data);
      setStrainData(data);
    };
    loadStrains();
  }, []);

  const toggleCategory = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  const handleStoreFilter = (store) => {
    setIsLoading(true);
    setSelectedStore(store);
    setTimeout(() => setIsLoading(false), 800);
  };

  // Shared placeholder and loading logic
  const getPlaceholderData = (type, store) => {
    if (isLoading) {
      return [{
        id: `loading-placeholder-${type}`,
        strain_name: 'Loading...',
        strain_type: '',
        image_url: null,
        description: 'Finding strains in your area'
      }];
    }
    
    if (!store || store === 'ALL') {
      return [{
        id: `pick-store-placeholder-${type}`,
        strain_name: 'Pick a Store',
        strain_type: '',
        image_url: null,
        description: 'Select a store to view available strains'
      }];
    }
    
    return null;
  };

  // Enhanced function for category sections 
  const getCategoryStrains = (allStrains, categoryId, store) => {
    // Return placeholder data if needed
    const placeholderData = getPlaceholderData(categoryId, store);
    if (placeholderData) return placeholderData;
    
    // If no strains, return empty array
    if (!allStrains || !allStrains[categoryId]) return [];
    
    // Cache management
    const cachedKey = `category-${categoryId}-${store}`;
    const cachedStrains = localStorage.getItem(cachedKey);
    const lastUpdate = localStorage.getItem(`${cachedKey}-timestamp`);
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    if (cachedStrains && lastUpdate && (now - parseInt(lastUpdate) < ONE_DAY)) {
      return JSON.parse(cachedStrains);
    }
    
    // Filter strains by store and category
    const categoryStrains = allStrains[categoryId]?.filter(strain => 
      strain.store_location && strain.store_location.toUpperCase().includes(store)
    ) || [];
    
    // If no strains found for this store and category, return empty
    if (categoryStrains.length === 0) return [];
    
    // Cache results
    localStorage.setItem(cachedKey, JSON.stringify(categoryStrains));
    localStorage.setItem(`${cachedKey}-timestamp`, now.toString());
    
    return categoryStrains;
  };

  // Function for weekly specials
  const getWeeklySpecials = (allStrains, store) => {
    // Return placeholder data if needed
    const placeholderData = getPlaceholderData('weekly', store);
    if (placeholderData) return placeholderData;

    const cachedKey = `weeklySpecials-${store}`;
    const cachedSpecials = localStorage.getItem(cachedKey);
    const lastUpdate = localStorage.getItem(`${cachedKey}-timestamp`);
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    if (cachedSpecials && lastUpdate && (now - parseInt(lastUpdate) < ONE_DAY)) {
      return JSON.parse(cachedSpecials);
    }

    // Get tagged specials for selected store
    const taggedSpecials = Object.values(allStrains)
      .flat()
      .filter(strain => 
        strain?.specials_tag === true && 
        strain.store_location && strain.store_location.toUpperCase().includes(store)
      );

    // Get random strains for selected store
    const randomSpecials = Object.entries(allStrains)
      .filter(([key]) => key !== 'weekly_specials')
      .flatMap(([_, strains]) => {
        return strains
          ?.filter(strain => 
            strain.store_location && strain.store_location.toUpperCase().includes(store) && 
            !strain.specials_tag
          )
          ?.sort(() => Math.random() - 0.5)
          ?.slice(0, 3) || [];
      });

    // Combine with tagged specials first, then random selections
    const newSpecials = [...taggedSpecials, ...randomSpecials];

    // Cache with store-specific key
    localStorage.setItem(cachedKey, JSON.stringify(newSpecials));
    localStorage.setItem(`${cachedKey}-timestamp`, now.toString());

    return newSpecials;
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
      { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" }
    );

    gsap.fromTo(
      categoriesRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 0.6,
        delay: 0.4,
        ease: "back.out(1.7)"
      }
    );
  }, []);

  return (
    <section className="bud-bar-page" ref={pageRef}>
      <StoreFilter onFilterChange={handleStoreFilter} />
      <div className="bud-bar-page__content">
        <h1 className="lab-title" ref={titleRef}>THE BUD BAR</h1>
        
        <p className="lab-subtitle">WEEKLY SPECIALS</p>
        <p className="lab-description">
          Check out what is hot on the shelves this week!
        </p>

        <div className="weekly_specials" id="weeklySpecialsWrapper" ref={specialsRef}>
          <div className="__content-wrapper">
            {getWeeklySpecials(strainData, selectedStore)?.map((strain, index) => (
              <StrainCard
                key={`weekly-${strain.id}-${index}`}
                id={strain.id}
                name={strain.strain_name}
                type={strain.strain_type}
                image={strain.image_url}
                thc={strain.thc}
                price={strain.price}
                description={strain.description}
                isSpecial={strain.specials_tag}
              />
            ))}
          </div>
        </div>

        <div className="lab-categories" id="categorySectionLab">
          {strainCategories.map((category, catIndex) => (
            <div
              className={`category-section ${openCategory !== category.id ? 'closed' : ''}`}
              key={category.id}
              id={category.id}
              ref={el => categoriesRef.current[catIndex] = el}
            >
              <div 
                className="category-section__btn opn-cls-btn" 
                id={`${category.id}Btn`}
                onClick={() => toggleCategory(category.id)}
              ></div>

              <h1 className="category-section__heading">{category.title}</h1>

              <div className="category-section__text">
                <p className="category-section__description">
                  {category.description}
                </p>
              </div>

              <div className="category-section__card-holder">
                {getCategoryStrains(strainData, category.id, selectedStore)?.map((strain, index) => (
                  <StrainCard
                    key={`${category.id}-${strain.id}-${index}`}
                    id={strain.id}
                    name={strain.strain_name}
                    type={strain.strain_type}
                    image={strain.image_url}
                    thc={strain.thc}
                    price={strain.price}
                    description={strain.description}
                    isSpecial={strain.specials_tag}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}