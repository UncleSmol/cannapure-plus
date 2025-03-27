
import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import "./budbar.css";

// Import components
import TopControls from './components/TopControls';
import WeeklySpecials from './components/WeeklySpecials';
import CategoriesList from './components/CategoriesList';
import DebugPanel from './components/DebugPanel';

// Import custom hooks
import useStrainData from './hooks/useStrainData';

// For debugging purposes
const DEBUG_MODE = true;

/**
 * BudBar Page Component - Main entry point for the BudBar page
 */
export default function BudBarPage() {
  // Animation refs
  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const specials_tagRef = useRef(null);
  const categoriesRef = useRef([]);
  
  // State management
  const [selectedStore, setSelectedStore] = useState('');
  const [openCategory, setOpenCategory] = useState(null);
  
  // Strain data management using custom hook
  const {
    strainData,
    categoryCounts,
    isLoading,
    errorMessage,
    refreshStrainData,
    logStrainData
  } = useStrainData(DEBUG_MODE);

  // Toggle category open/closed state
  const toggleCategory = (categoryId) => {
    // If clicking the currently open category, close it
    if (openCategory === categoryId) {
      setOpenCategory(null);
    } else {
      // Otherwise, open the clicked category (closing any previously open one)
      setOpenCategory(categoryId);
      
      // Smooth scroll to the selected category after a short delay
      setTimeout(() => {
        const element = document.getElementById(categoryId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Handle store filter change
  const handleStoreFilter = (store) => {
    setSelectedStore(store);
  };

  // Page animations
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
      specials_tagRef.current,
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
      <TopControls
        onStoreFilterChange={handleStoreFilter}
        onRefreshData={refreshStrainData}
      />
      
      <div className="bud-bar-page__content">
        <h1 className="lab-title" ref={titleRef}>THE BUD BAR</h1>
        <p className="lab-description">
          Check out what is hot on the shelves this week!
        </p>
        
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        
        {DEBUG_MODE && (
          <DebugPanel
            categoryCounts={categoryCounts}
            onLogData={logStrainData}
            onRefresh={refreshStrainData}
          />
        )}

        <WeeklySpecials
          strainData={strainData}
          selectedStore={selectedStore}
          isLoading={isLoading}
          animationRef={specials_tagRef}
        />

        <CategoriesList
          strainData={strainData}
          selectedStore={selectedStore}
          isLoading={isLoading}
          openCategory={openCategory}
          onToggleCategory={toggleCategory}
          categoriesRef={categoriesRef}
          debugMode={DEBUG_MODE}
        />
      </div>
    </section>
  );
}
