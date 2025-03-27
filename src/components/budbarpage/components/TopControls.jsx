import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import StoreFilter from '../../store_filter/StoreFilter';
import RefreshDataButton from '../../common/RefreshDataButton';

/**
 * Top controls component with store filter and refresh button
 * Features fade-in/fade-out behavior when scrolling for better UX
 */
const TopControls = ({ onStoreFilterChange, onRefreshData }) => {
  const controlsRef = useRef(null);
  const [controlsOpacity, setControlsOpacity] = useState(1);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  
  // Handle scroll events to adjust opacity and position
  useEffect(() => {
    const handleScroll = () => {
      // Skip if user is actively interacting with controls
      if (userInteracted) return;
      
      // Adjust opacity based on scroll position
      if (window.scrollY > 100) {
        setControlsOpacity(0.3); // Reduced opacity when scrolled
        setIsFixed(true);
      } else {
        setControlsOpacity(1); // Full opacity at top
        setIsFixed(false);
      }
    };
    
    // Set up scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Handle initial scroll position
    handleScroll();
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [userInteracted]);
  
  // Handle user interaction with controls
  const handleControlsInteraction = (interacting) => {
    setUserInteracted(interacting);
    
    if (interacting) {
      // Restore full opacity when user interacts
      setControlsOpacity(1);
      
      // Clear previous timeout if exists
      if (window.controlsTimeoutId) {
        clearTimeout(window.controlsTimeoutId);
      }
      
      // Reset interaction flag after delay
      window.controlsTimeoutId = setTimeout(() => {
        setUserInteracted(false);
      }, 3000); // 3 seconds after last interaction
    }
  };

  return (
    <div 
      className={`bud-bar-top-controls ${isFixed ? 'fixed-position' : ''}`}
      ref={controlsRef}
      style={{ 
        opacity: controlsOpacity, 
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: isFixed ? 'translateY(0)' : 'none',
        position: isFixed ? 'sticky' : 'relative',
        top: isFixed ? '0' : 'auto',
        zIndex: isFixed ? '100' : 'auto',
        background: isFixed ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        boxShadow: isFixed ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
        padding: isFixed ? '10px 15px' : '0',
      }}
      onMouseEnter={() => handleControlsInteraction(true)}
      onMouseLeave={() => handleControlsInteraction(false)}
      onTouchStart={() => handleControlsInteraction(true)}
      onClick={() => handleControlsInteraction(true)}
    >
      <StoreFilter 
        onFilterChange={onStoreFilterChange} 
        onInteraction={() => handleControlsInteraction(true)}
      />
      <RefreshDataButton 
        onRefresh={onRefreshData} 
        className="bud-refresh-button"
        onInteraction={() => handleControlsInteraction(true)}
      />
    </div>
  );
};

TopControls.propTypes = {
  onStoreFilterChange: PropTypes.func.isRequired,
  onRefreshData: PropTypes.func.isRequired
};

export default TopControls;
