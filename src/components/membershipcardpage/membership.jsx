import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import "./membership.css";

// Import utility functions
import { TIER_INFO } from "./utils/constants";
import { applyTierAnimations, applyEntranceAnimations, animateCardClose } from "./utils/animations";
import { formatDate, formatActiveDays } from "./utils/dateUtils";
import { getBadgeImage, getBadgeAltText } from "./utils/badgeUtils";

// Import loading spinner
import LoadingSpinner from "../common/LoadingSpinner";

// Import disclaimer component
import MembershipDisclaimer from "./disclaimer/MembershipDisclaimer";

// Import logo image
import logoPlaceholder from "../../assets/images/cannapure-plus-logo.png";

// Add API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function MembershipCardHolder() {
  const { user, isAuthenticated } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  // Create refs for DOM elements
  const pageRef = useRef(null);
  const cardRef = useRef(null);
  const badgeRef = useRef(null);
  const logoRef = useRef(null);
  const userInfoRef = useRef(null);
  const closeButtonRef = useRef(null);
  const tierInfoRef = useRef(null);
  const infoPanelsRef = useRef(null);

  // Fetch user membership data
  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        if (!isAuthenticated || !user) {
          throw new Error('User not authenticated');
        }

        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`${API_BASE_URL}/users/membership/current`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Membership data:', response.data);
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching membership data:', err);
        setError('Failed to load membership data. Please try again later.');
        setLoading(false);
        
        if (err.message === 'User not authenticated') {
          navigate('/auth');
        }
      }
    };

    fetchMembershipData();
  }, [isAuthenticated, user, navigate]);

  // Setup animations after data is loaded
  useEffect(() => {
    if (!userData || loading) return;
    
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
    
    const entranceCleanup = applyEntranceAnimations(refs);
    
    // IMPORTANT: Use the calculated tier from the API
    const calculatedTier = userData.calculated_tier?.toLowerCase() || 'basic';
    console.log(`Using tier: ${calculatedTier} for animations`);
    
    // Apply tier-specific animations
    const tierCleanup = applyTierAnimations(calculatedTier, { cardRef, badgeRef });
    
    // Return combined cleanup function
    return () => {
      if (typeof entranceCleanup === 'function') entranceCleanup();
      if (typeof tierCleanup === 'function') tierCleanup();
    };
  }, [userData, loading]);

  const handleCloseCard = () => {
    animateCardClose(cardRef, () => {
      navigate('/');
    });
  };

  // Updated render logic to use API data
  const renderContent = () => {
    if (loading) {
      return (
        <div className="membership-loading">
          <LoadingSpinner size="large" />
        </div>
      );
    }

    if (error || !userData) {
      return (
        <div className="membership-error">
          <p>{error || 'No membership information found'}</p>
          <button onClick={() => navigate('/auth')}>Login</button>
        </div>
      );
    }

    const calculatedTier = userData.calculated_tier?.toLowerCase() || 'basic';
    const tierInfo = TIER_INFO[calculatedTier] || TIER_INFO.basic;
    
    return (
      <div id="membershipCardHolder" className="membership" ref={pageRef}>
        <MembershipDisclaimer />
        
        <div className="membership-card__close" onClick={handleCloseCard} ref={closeButtonRef}>
          ×
        </div>

        <div className="membership-container">
          <div 
            id="membershipCard" 
            className={`tier-${calculatedTier}`}
            data-badge={calculatedTier}
            ref={cardRef}
          >
            {/* Top Section */}
            <div id="topCardSection">
              <span id="cardBadgeWrapper">
                <div className="badgeWrapper active" data-tier={calculatedTier}>
                  <img src={getBadgeImage(calculatedTier)} alt={`${tierInfo.name} badge`} />
                </div>
              </span>
              <span id="cardLogo" ref={logoRef}>
                <img src={logoPlaceholder} alt="Cannapure logo" />
              </span>
            </div>

            {/* Bottom Section */}
            <div id="bottomCardSection">
              <div id="userName" ref={userInfoRef}>
                <p className="member-name">{`${userData.first_name} ${userData.last_name}`}</p>
                <p className="member-id">{userData.cpNumber}</p>
                <p className="member-active">
                  Active for: 
                  <span className="days-count"> {formatActiveDays(userData.calculated_days)}</span>
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

          {/* Info Panels */}
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
                  {userData.membership_status}
                </div>
              </div>
              <div className="info-panel__content">
                <div className="info-panel__label">Issued Date</div>
                <div className="info-panel__value">
                  {formatDate(userData.membership_start_date)}
                </div>
              </div>
              <div className="info-panel__content">
                <div className="info-panel__label">Active Days</div>
                <div className="info-panel__value">
                  {formatActiveDays(userData.calculated_days)}
                </div>
              </div>
              {userData.days_to_next_tier > 0 && (
                <div className="info-panel__content">
                  <div className="info-panel__label">Next Tier In</div>
                  <div className="info-panel__value next-tier">
                    {formatActiveDays(userData.days_to_next_tier)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return renderContent();
}
