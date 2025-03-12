import React, { useState } from 'react';
import './StoreFilter.css';

const StoreFilter = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState('ALL');

  const stores = ['ALL', 'WITBANK', 'DULLSTROOM'];

  const handleStoreSelect = (store) => {
    const selectedValue = store === 'ALL' ? '' : store;
    setSelectedStore(selectedValue);
    onFilterChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="store-filter">
      <button 
        className="store-filter__button" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedStore} STORE
      </button>
      
      {isOpen && (
        <div className="store-filter__dropdown">
          {stores.map(store => (
            <button
              key={store}
              className={`store-filter__option ${selectedStore === store ? 'active' : ''}`}
              onClick={() => handleStoreSelect(store)}
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
