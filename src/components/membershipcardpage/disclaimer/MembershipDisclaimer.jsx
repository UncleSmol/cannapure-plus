import React, { useState, useRef, useEffect } from 'react';
import './MembershipDisclaimer.css';
import { FaInfoCircle } from 'react-icons/fa';

const MembershipDisclaimer = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);
  
  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
    
    // Prevent body scrolling when popup is open
    if (!isPopupOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
        document.body.style.overflow = '';
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsPopupOpen(false);
        document.body.style.overflow = '';
      }
    };

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isPopupOpen]);

  return (
    <div className="membership-disclaimer">
      <button 
        className="disclaimer-icon" 
        onClick={togglePopup}
        aria-label="Membership Terms and Conditions"
        title="Membership Information"
      >
        <FaInfoCircle />
      </button>
      
      {isPopupOpen && (
        <>
          <div className="disclaimer-overlay"></div>
          <div className="disclaimer-popup-container">
            <div className="disclaimer-popup" ref={popupRef}>
              <div className="disclaimer-popup-header">
                <h3>Membership Tier Information</h3>
                <button 
                  className="close-popup" 
                  onClick={() => {
                    setIsPopupOpen(false);
                    document.body.style.overflow = '';
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
          <div className="disclaimer-popup-content">
            <h4>About Membership Tiers</h4>
            <p>
              The membership tier system displayed on your card is designed to recognize 
              your loyalty and continued membership with Cannapure Plus.
            </p>
            
            <h4>Important Disclaimer</h4>
            <p>
              Please note that membership tiers are <strong>not related to any in-store 
              promotions or exclusive benefits</strong>. They are strictly a visual 
              representation of your membership duration and activity.
            </p>
            
            <h4>Tier Reset Policy</h4>
            <p>
              Membership tiers will reset if your account remains inactive for a period of 
              one month (30 days). Regular activity ensures your tier status remains intact.
            </p>
            
            <h4>Tier Progression</h4>
            <ul>
              <li><span className="tier-basic">Basic</span>: 0-59 days of active membership</li>
              <li><span className="tier-gold">Gold</span>: 60-119 days of active membership</li>
              <li><span className="tier-diamond">Diamond</span>: 120-239 days of active membership</li>
              <li><span className="tier-emerald">Emerald</span>: 240-479 days of active membership</li>
              <li><span className="tier-tropez">Tropez</span>: 480+ days of active membership</li>
            </ul>
            
            <p className="disclaimer-note">
              Thank you for being a valued member of Cannapure Plus. We appreciate your 
              continued support!
            </p>
          </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MembershipDisclaimer;
