import React from 'react';
import PropTypes from 'prop-types';
import { StrainCard } from '../../strain_card/StrainCard';
import { getCategoryStrains } from '../utils/strainDataUtils';

/**
 * Individual category section component
 */
const CategorySection = ({ 
  category, 
  strainData,
  selectedStore, 
  isLoading,
  isOpen,
  animRef,
  onToggle,
  debugMode
}) => {
  const categoryStrains = getCategoryStrains(
    strainData, 
    category.id, 
    selectedStore,
    isLoading
  );
  
  return (
    <div
      className={`category-section ${isOpen ? 'open' : 'closed'}`}
      id={category.id}
      ref={animRef}
    >
      <div 
        className={`category-section__btn opn-cls-btn ${isOpen ? 'open' : 'closed'}`}
        id={`${category.id}Btn`}
        onClick={() => onToggle(category.id)}
        aria-expanded={isOpen}
        aria-controls={`${category.id}-content`}
      >
        <span className="visually-hidden">
          {isOpen ? `Close ${category.title}` : `Open ${category.title}`}
        </span>
      </div>

      <h1 
        className="category-section__heading"
        onClick={() => onToggle(category.id)}
      >
        {category.title}
        {debugMode && <span className="count-badge">({categoryStrains.length})</span>}
      </h1>

      <div className="category-section__text">
        <p className="category-section__description">
          {category.description}
        </p>
      </div>

      {/* The content container with conditional rendering based on open/closed state */}
      <div 
        className={`category-section__card-holder ${isOpen ? 'visible' : 'hidden'}`}
        id={`${category.id}-content`}
        style={{
          display: isOpen ? 'flex' : 'none',
          height: isOpen ? 'auto' : '0',
          overflow: isOpen ? 'visible' : 'hidden',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        {categoryStrains.length > 0 ? (
          categoryStrains.map((strain, index) => (
            <StrainCard
              key={`${category.id}-${strain.id || index}-${index}`}
              id={strain.id}
              name={strain.strain_name}
              type={strain.strain_type}
              image={strain.image_url}
              thc={strain.thc}
              price={strain.price}
              description={strain.description}
              isSpecial={strain.special || strain.isSpecial}
            />
          ))
        ) : (
          <div className="empty-category">
            <p>No {category.title.toLowerCase()} available{selectedStore ? ` for ${selectedStore}` : ''}</p>
          </div>
        )}
        <div className="scroll-spacer"></div>
      </div>
    </div>
  );
};

CategorySection.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired,
  strainData: PropTypes.object.isRequired,
  selectedStore: PropTypes.string,
  isLoading: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  animRef: PropTypes.func,
  onToggle: PropTypes.func.isRequired,
  debugMode: PropTypes.bool
};

export default CategorySection;
