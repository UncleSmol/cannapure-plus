import React, { useState, useEffect, useRef } from 'react';
import './StoreFilter.css';

/**
 * StoreFilter - A dropdown component for filtering content by store location
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onFilterChange - Callback function when store selection changes
 * @param {Function} props.onInteraction - Callback function when user interacts with the component
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - The rendered component
 */
const StoreFilter = ({ onFilterChange, onInteraction, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState('ALL');
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const stores = ['ALL', 'WITBANK', 'DULLSTROOM'];

  // Notify parent about interaction
  const notifyInteraction = () => {
    if (typeof onInteraction === 'function') {
      onInteraction();
    }
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
    notifyInteraction();
  };

  const handleStoreSelect = (store) => {
    const displayStore = store === 'ALL' ? 'ALL' : store;
    const filterValue = store === 'ALL' ? '' : store;
    
    setSelectedStore(displayStore);
    onFilterChange(filterValue);
    setIsOpen(false);
    notifyInteraction();
  };

  return (
    <div 
      className={`store-filter ${className}`} 
      ref={dropdownRef}
      onMouseEnter={notifyInteraction}
      onTouchStart={notifyInteraction}
    >
      <button 
        className="store-filter__button" 
        onClick={handleButtonClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {selectedStore} STORE
      </button>
      
      {isOpen && (
        <div 
          className="store-filter__dropdown"
          role="menu"
          aria-orientation="vertical"
        >
          {stores.map(store => (
            <button
              key={store}
              className={`store-filter__option ${selectedStore === store ? 'active' : ''}`}
              onClick={() => handleStoreSelect(store)}
              role="menuitem"
            >
              {store}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreFilter;