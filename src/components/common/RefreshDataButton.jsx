import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./RefreshDataButton.css";

/**
 * RefreshDataButton - A styled button component for clearing cached data
 * and refreshing the application with the latest data
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onRefresh - Optional callback to run after cache is cleared
 * @param {Function} props.onInteraction - Callback function when user interacts with the component
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - The rendered button component
 */
const RefreshDataButton = ({ onRefresh, onInteraction, className = "" }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const buttonRef = useRef(null);
  
  // Notify parent about interaction
  const notifyInteraction = () => {
    if (typeof onInteraction === 'function') {
      onInteraction();
    }
  };
  
  // Animate the button on mount
  useEffect(() => {
    gsap.fromTo(
      buttonRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, []);
  
  
  /**
   * Clear all strain-related cache from localStorage
   */
  const clearStrainCache = () => {
    try {
      // Find and clear all strain-related cache
      const keysToRemove = [];
      
      // Main strain data cache
      keysToRemove.push('strain_data_cache', 'strain_data_timestamp');
      
      // Category-specific cache
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('category-') || 
          key.startsWith('weeklyspecials_tag-') ||
          key.includes('-timestamp')
        )) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all identified keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      return {
        success: true,
        count: keysToRemove.length
      };
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  /**
   * Handle button click to refresh data
   */
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    notifyInteraction();
    setIsRefreshing(true);
    
    // Animate button while refreshing
    gsap.to(buttonRef.current, {
      rotation: 360,
      duration: 1,
      ease: "power1.inOut"
    });
    
    try {
      // Clear the strain data cache
      const result = clearStrainCache();
      
      if (result.success) {
        // Call the onRefresh callback if provided
        if (typeof onRefresh === 'function') {
          await onRefresh();
        } else {
          // Default: reload the page after a short delay
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
      
      // Reset button rotation
      gsap.to(buttonRef.current, {
        rotation: 0,
        duration: 0.5,
        ease: "power1.out"
      });
    }
  };
  
  return (
    <div 
      className={`refresh-button-container ${className}`}
      onMouseEnter={notifyInteraction}
      onTouchStart={notifyInteraction}
    >
      <button
        ref={buttonRef}
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`refresh-data-button ${isRefreshing ? "refreshing" : ""}`}
        aria-label="Refresh strain data"
      >
        <span className="refresh-text">
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </span>
        <span className="refresh-icon">↻</span>
      </button>
    </div>
  );
};

export default RefreshDataButton;