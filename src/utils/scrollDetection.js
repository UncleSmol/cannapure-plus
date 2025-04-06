/**
 * Utility functions for detecting and handling horizontal scrolling
 */

/**
 * Set up scroll detection for horizontal scrollable elements
 * This adds the 'scrolled' class when the user has scrolled
 * and handles the visibility of scroll indicators
 * 
 * @param {string} selector - CSS selector for scrollable elements
 */
export const setupScrollDetection = (selector = '.weekly_specials_tag .__content-wrapper, .category-section__card-holder') => {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initScrollDetection(selector));
    } else {
      initScrollDetection(selector);
    }
  };
  
  /**
   * Initialize scroll detection on matching elements
   */
  const initScrollDetection = (selector) => {
    const scrollableElements = document.querySelectorAll(selector);
    
    scrollableElements.forEach(element => {
      // Check if element has overflow content
      const hasOverflow = element.scrollWidth > element.clientWidth;
      
      // Only show scroll indicator if there's overflow
      if (!hasOverflow) {
        // Hide scroll indicator if no overflow
        element.classList.add('scrolled');
      }
      
      // Set up scroll listener
      element.addEventListener('scroll', () => {
        handleScroll(element);
      });
      
      // Initial check
      handleScroll(element);
    });
  };
  
  /**
   * Handle scroll event on an element
   */
  const handleScroll = (element) => {
    // Check if user has scrolled horizontally
    const hasScrolled = element.scrollLeft > 20;
    
    // Add/remove scrolled class based on scroll position
    if (hasScrolled) {
      element.classList.add('scrolled');
    } else {
      element.classList.remove('scrolled');
    }
    
    // Check if scrolled to end
    const isAtEnd = Math.abs(
      (element.scrollWidth - element.clientWidth) - element.scrollLeft
    ) < 10;
    
    // Add class when scrolled to end
    if (isAtEnd) {
      element.classList.add('scroll-end');
    } else {
      element.classList.remove('scroll-end');
    }
  };
  
  /**
   * Add scroll indicator animation to scrollable elements
   */
  export const addScrollHint = (selector = '.weekly_specials_tag .__content-wrapper, .category-section__card-holder') => {
    const scrollableElements = document.querySelectorAll(selector);
    
    scrollableElements.forEach(element => {
      // Only add hint if element has overflow
      if (element.scrollWidth > element.clientWidth) {
        // Add subtle animation to hint at scrollability
        element.classList.add('hint-scroll');
        
        // Remove hint after user interaction
        element.addEventListener('scroll', () => {
          element.classList.remove('hint-scroll');
        }, { once: true });
      }
    });
  };
  
  // Run the setup when this file is imported
  setupScrollDetection();