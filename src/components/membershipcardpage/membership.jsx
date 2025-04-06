import React, { useRef, useEffect } from "react";
import "./membership.css";

// Import utility functions
import { TIER_INFO } from "./utils/constants";
import { applyTierAnimations, applyEntranceAnimations, animateCardClose } from "./utils/animations";
import { formatDate, calculateActiveDays, formatActiveDays } from "./utils/dateUtils";
import { determineTierFromDays } from "./utils/tierUtils";
import { getBadgeImage, getBadgeAltText } from "./utils/badgeUtils";

// Import logo image
import logoPlaceholder from "../../assets/images/cannapure-plus-logo.png";

// Mock data for development
const mockUserData = {
  firstName: "John",
  last_name: "Doe",
  cpNumber: "CP123456",
  issuedDate: "2023-01-01",
  membershipStatus: "ACTIVE"
};

export default function MembershipCardHolder() {
  // Create refs for DOM elements
  const pageRef = useRef(null);
  const cardRef = useRef(null);
  const badgeRef = useRef(null);
  const logoRef = useRef(null);
  const userInfoRef = useRef(null);
  const closeButtonRef = useRef(null);
  const tierInfoRef = useRef(null);
  const infoPanelsRef = useRef(null);

  // Setup animations
  useEffect(() => {
    // Apply entrance animations
    const refs = {
      pageRef,
      cardRef,
      logoRef,
      badgeRef,
      userInfoRef,
      tierInfoRef,
      infoPanelsRef,
      closeButtonRef
    };
    
    applyEntranceAnimations(refs);
    
    // Calculate active days and determine tier
    const activeDays = calculateActiveDays(mockUserData.issuedDate);
    const calculatedTier = determineTierFromDays(activeDays);
    
    // Apply tier-specific animations
    const cleanup = applyTierAnimations(calculatedTier, { cardRef, badgeRef });
    
    return cleanup;
  }, []);

  const handleCloseCard = () => {
    animateCardClose(cardRef, () => {
      window.location.hash = "homePage";
    });
  };

  // Calculate membership info
  const activeDays = calculateActiveDays(mockUserData.issuedDate);
  const calculatedTier = determineTierFromDays(activeDays);
  const tierInfo = TIER_INFO[calculatedTier] || TIER_INFO.basic;

  return (
    <div id="membershipCardHolder" className="membership" ref={pageRef}>
      <div 
        className="membership-card__close" 
        onClick={handleCloseCard}
        ref={closeButtonRef}
        aria-label="Close membership card"
      >
        ×
      </div>

      <div className="membership-container">
        <div 
          id="membershipCard" 
          className={`tier-${calculatedTier}`}
          data-badge={calculatedTier}
          ref={cardRef}
        >
          {/* Top Section of the Membership Card */}
          <div id="topCardSection">
            <span id="cardBadgeWrapper">
              <div className="badgeWrapper active" data-tier={calculatedTier}>
                <img 
                  src={getBadgeImage(calculatedTier)} 
                  alt={`${tierInfo.name} badge`} 
                />
              </div>
            </span>

            <span id="cardLogo" ref={logoRef}>
              <img src={logoPlaceholder} alt="Cannapure logo" />
            </span>
          </div>

          {/* Bottom Section of the Membership Card */}
          <div id="bottomCardSection">
            <div id="userName" ref={userInfoRef}>
              <p className="member-name">{`${mockUserData.firstName} ${mockUserData.last_name}`}</p>
              <p className="member-id">{mockUserData.cpNumber}</p>
              <p className="member-active">
                Active for: 
                <span className="days-count"> {formatActiveDays(activeDays)}</span>
              </p>
            </div>

            <div id="currentBadgeStatusWrapper">
              <img
                src={getBadgeImage(calculatedTier)}
                alt={getBadgeAltText(calculatedTier, tierInfo)}
                ref={badgeRef}
              />
            </div>
          </div>
        </div>

        {/* External Info Panels */}
        <div className="membership-info-panels" ref={infoPanelsRef}>
          <div className="membership-info-panel">
            <div className="info-panel__title">Account Status</div>
            <div className="info-panel__content">
              <div className="info-panel__label">Current Tier</div>
              <div className="info-panel__value highlight">{tierInfo.name}</div>
            </div>
            <div className="info-panel__content">
              <div className="info-panel__label">Status</div>
              <div className="info-panel__value status-active">
                {mockUserData.membershipStatus}
              </div>
            </div>
            <div className="info-panel__content">
              <div className="info-panel__label">Issued Date</div>
              <div className="info-panel__value">{formatDate(mockUserData.issuedDate)}</div>
            </div>
            <div className="info-panel__content">
              <div className="info-panel__label">Active Days</div>
              <div className="info-panel__value">{formatActiveDays(activeDays)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}