import React from 'react';
import PropTypes from 'prop-types';
import { StrainCard } from '../../strain_card/StrainCard';
import { getWeeklySpecials } from '../utils/strainDataUtils';

/**
 * Weekly specials section component
 */
const WeeklySpecials = ({ strainData, selectedStore, isLoading, animationRef }) => {
  const weeklySpecials = getWeeklySpecials(strainData, selectedStore, isLoading);
  
  return (
    <div className="weekly_specials_tag" id="weeklyspecials_tagWrapper" ref={animationRef}>
      <h3 className="section-title">Weekly Specials</h3>
      <div className="__content-wrapper">
        {weeklySpecials?.length > 0 ? (
          weeklySpecials.map((strain, index) => (
            <StrainCard
              key={`weekly-${strain.id || index}-${index}`}
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
          <div className="empty-state">
            <p>No specials available for this store</p>
          </div>
        )}
        <div className="scroll-spacer"></div>
      </div>
    </div>
  );
};

WeeklySpecials.propTypes = {
  strainData: PropTypes.object.isRequired,
  selectedStore: PropTypes.string,
  isLoading: PropTypes.bool,
  animationRef: PropTypes.object
};

export default WeeklySpecials;
