import React from 'react';
import PropTypes from 'prop-types';
import CategorySection from './CategorySection';
import { strainCategories } from '../config/categories';

/**
 * Component for rendering the list of strain categories
 */
const CategoriesList = ({ 
  strainData, 
  selectedStore, 
  isLoading, 
  openCategory,
  onToggleCategory,
  categoriesRef,
  debugMode
}) => {
  return (
    <div className="lab-categories" id="categorySectionLab">
      {strainCategories.map((category, catIndex) => (
        <CategorySection
          key={category.id}
          category={category}
          strainData={strainData}
          selectedStore={selectedStore}
          isLoading={isLoading}
          isOpen={openCategory === category.id}
          animRef={el => categoriesRef.current[catIndex] = el}
          onToggle={onToggleCategory}
          debugMode={debugMode}
        />
      ))}
    </div>
  );
};

CategoriesList.propTypes = {
  strainData: PropTypes.object.isRequired,
  selectedStore: PropTypes.string,
  isLoading: PropTypes.bool,
  openCategory: PropTypes.string,
  onToggleCategory: PropTypes.func.isRequired,
  categoriesRef: PropTypes.object.isRequired,
  debugMode: PropTypes.bool
};

export default CategoriesList;