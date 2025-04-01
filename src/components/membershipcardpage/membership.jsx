import React, { useRef, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import "./membership.css";

// Import utility functions
import { TIER_INFO } from "./utils/constants";
import { applyTierAnimations, applyEntranceAnimations, animateCardClose } from "./utils/animations";
import { fetchMembershipData, createMockMembershipData, getErrorMessage } from "./utils/dataUtils";
import { formatDate, calculateActiveDays, formatActiveDays } from "./utils/dateUtils";
import { determineTierFromDays } from "./utils/tierUtils";
import { getBadgeImage, getBadgeAltText } from "./utils/badgeUtils";

// Import logo image
import logoPlaceholder from "../../assets/images/cannapure-plus-logo.png";

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
  
  // State for user data with loading and error handling
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get authentication context
  const { isAuthenticated, user, token, loading: authLoading } = useAuth();
  // Add this line to get token from localStorage if not provided by context
  const authToken = token || localStorage.getItem('token');

  // TESTING: Override active days for testing different tiers
  // Change this value to test different tiers:
  // 0-59: Basic, 60-119: Gold, 120-239: Diamond, 240-479: Emerald, 480+: Tropez
  const testActiveDays = null; // Set to null to use actual calculated days

  // Debug auth information
  useEffect(() => {
    console.log('Auth Debug in MembershipCardHolder:', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      authLoading,
      tokenFromStorage: localStorage.getItem('token') ? 'Token exists' : 'No token',
      userFromStorage: localStorage.getItem('userData') ? 'User data exists' : 'No user data',
      tokenLength: localStorage.getItem('token') ? localStorage.getItem('token').length : 0
    });
    
    // Check token format
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        // Check if token is valid JWT format (has 3 parts separated by dots)
        const parts = storedToken.split('.');
        console.log('Token parts:', parts.length);
        if (parts.length !== 3) {
          console.warn('Token does not appear to be in valid JWT format');
        } else {
          console.log('Token appears to be valid JWT format');
          // Try to decode payload
          try {
            const payload = JSON.parse(atob(parts[1]));
            console.log('Token payload:', {
              exp: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No exp',
              iat: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'No iat',
              userId: payload.userId || payload.sub || 'No user ID'
            });
          } catch (e) {
            console.error('Error decoding token payload:', e);
          }
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
  }, [isAuthenticated, user, token, authLoading]);

  // Fetch user data from API
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount
    
    const getMembershipData = async () => {
      // Don't proceed if auth is still loading
      if (authLoading) {
        console.log("Auth is still loading, waiting...");
        return;
      }
  
      // Don't proceed if not authenticated
      if (!isAuthenticated || !authToken) {
        console.warn('User is not authenticated, cannot fetch membership data');
        if (isMounted) {
          setError('Please log in to view your membership details');
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
        }
        
        // Fetch membership data
        const data = await fetchMembershipData(authToken);
        
        if (isMounted) {
          setUserData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        
        if (isMounted) {
          setError(getErrorMessage(err));
          setLoading(false);
          
          // If we get here, try using fallback mock data based on the user context
          console.log('Using fallback mock data from user context');
          if (user) {
            const mockData = createMockMembershipData(user);
            setUserData(mockData);
          }
        }
      }
    };

    getMembershipData();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, authToken, user, authLoading]); // Added authLoading to dependencies

  // Setup animations
  useEffect(() => {
    if (!userData) return;
    
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
    const activeDays = testActiveDays !== null ? testActiveDays : calculateActiveDays(userData.issuedDate);
    const calculatedTier = determineTierFromDays(activeDays);
    
    // Apply tier-specific animations based on calculated tier
    const cleanup = applyTierAnimations(calculatedTier, { cardRef, badgeRef });
    
    // Cleanup function
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [userData, testActiveDays]);

  const handleCloseCard = () => {
    // Navigate to homepage after animation completes
    animateCardClose(cardRef, () => {
      window.location.hash = "homePage";
    });
  };

  // Show auth loading state
  if (authLoading) {
    return (
      <div id="membershipCardHolder" className="membership" ref={pageRef}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // Show data loading state
  if (loading && isAuthenticated) {
    return (
      <div id="membershipCardHolder" className="membership" ref={pageRef}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your membership details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !userData) {
    return (
      <div id="membershipCardHolder" className="membership" ref={pageRef}>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
          {!isAuthenticated && (
            <button 
              onClick={() => window.location.hash = "loginPage"} 
              className="login-button"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show no data state
  if (!userData) {
    return (
      <div id="membershipCardHolder" className="membership" ref={pageRef}>
        <div className="not-found-container">
          <h3>No Membership Found</h3>
          <p>We couldn't find any membership details for your account.</p>
          <button onClick={() => window.location.hash = "homePage"} className="home-button">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate active days (either from test value or actual calculation)
  const activeDays = testActiveDays !== null ? testActiveDays : calculateActiveDays(userData.issuedDate);
  
  // Determine tier based on active days
  const calculatedTier = determineTierFromDays(activeDays);
  
  // Get tier information based on calculated tier
  const tierInfo = TIER_INFO[calculatedTier] || TIER_INFO.basic;
  
  // Determine membership status class
  const getStatusClass = () => {
    const status = userData.membershipStatus || userData.status;
    if (status && status.toUpperCase() !== 'ACTIVE') return 'status-inactive';
    if (activeDays < 30) return 'status-expiring';
    return 'status-active';
  };

  return (
    <div id="membershipCardHolder" className="membership" ref={pageRef}>
      <div 
        className="membership-card__close" 
        id="closeCardBtn" 
        onClick={handleCloseCard}
        ref={closeButtonRef}
        aria-label="Close membership card"
      >
        ×
      </div>

      <div className="membership-container">
        {/* Membership Card - Using calculated tier instead of userData.membershipTier */}
        <div 
          id="membershipCard" 
          className={`tier-${calculatedTier}`}
          data-badge={calculatedTier}
          ref={cardRef}
        >
          {/* Top Section of the Membership Card */}
          <div id="topCardSection">
            <span id="cardBadgeWrapper">
              <div 
                className={`badgeWrapper active`} 
                data-tier={calculatedTier}
              >
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

          {/* Bottom Section of the Membership Card - Only name, CP number, and active days */}
          <div id="bottomCardSection">
            <div id="userName" ref={userInfoRef}>
              <p className="member-name">{`${userData.firstName || ''} ${userData.last_name || ''}`}</p>
              <p className="member-id">{userData.cpNumber || 'CP000000'}</p>
              <p className="member-active">
                Active for: 
                <span className="days-count"> {formatActiveDays(activeDays)}
                </span>
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

          {/* Account Status Panel */}
          <div className="membership-info-panel">
            <div className="info-panel__title">Account Status</div>
            <div className="info-panel__content">
              <div className="info-panel__label">Current Tier</div>
              <div className="info-panel__value highlight">{tierInfo.name}</div>
            </div>
            <div className="info-panel__content">
              <div className="info-panel__label">Status</div>
              <div className={`info-panel__value ${getStatusClass()}`}>
                {userData.membershipStatus || 'ACTIVE'}
              </div>
            </div>
            {userData.issuedDate && (
              <div className="info-panel__content">
                <div className="info-panel__label">Issued Date</div>
                <div className="info-panel__value">{formatDate(userData.issuedDate)}</div>
              </div>
            )}
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