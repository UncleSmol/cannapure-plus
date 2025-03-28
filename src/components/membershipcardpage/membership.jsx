import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import axios from "axios";
import "./membership.css";

// Import images
import logoPlaceholder from "../../assets/images/cannapure-plus-logo.png";
import goldBadge from "../../assets/images/badges/gold-badge.png";
import diamondBadge from "../../assets/images/badges/diamond-badge.png";
import emeraldBadge from "../../assets/images/badges/emerald-badge.png";
import tropezBadge from "../../assets/images/badges/tropez-badge.png";

// API URL configuration - FIXED: removed trailing slash to prevent double slashes
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Mock data for fallback
const MOCK_USER_DATA = {
  firstName: "Guest",
  last_name: "User",
  cpNumber: "CP000000",
  activeDays: 0,
  membershipTier: "basic"
};

export default function MembershipCardHolder() {
  const pageRef = useRef(null);
  const cardRef = useRef(null);
  const badgeRef = useRef(null);
  const logoRef = useRef(null);
  const userInfoRef = useRef(null);
  const closeButtonRef = useRef(null);
  
  // Animation timelines
  const cardTimeline = useRef(null);
  const tierTimeline = useRef(null);
  
  // State for user data with loading and error handling
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get badge image based on membership tier
  const getBadgeImage = (tier) => {
    switch(tier) {
      case 'gold':
        return goldBadge;
      case 'diamond':
        return diamondBadge;
      case 'emerald':
        return emeraldBadge;
      case 'tropez':
        return tropezBadge;
      default:
        return logoPlaceholder; // Default badge for basic tier
    }
  };

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fixed: Using proper endpoint structure
        const endpoint = '/user/membership';
        console.log('Fetching membership data from:', `${API_URL}/api${endpoint}`);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // Set up request config
        const config = token ? {
          headers: {
            Authorization: `Bearer ${token}`
          }
        } : {};
        
        // Make the API request with the correct URL
        const response = await axios.get(`${API_URL}/api${endpoint}`, config);
        
        console.log('Membership data received:', response.data);
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        
        // Try fallback endpoint if main one fails
        try {
          console.log('Trying fallback endpoint');
          const fallbackResponse = await axios.get(`${API_URL}/api/membership`);
          console.log('Fallback data received:', fallbackResponse.data);
          setUserData(fallbackResponse.data);
          setLoading(false);
        } catch (fallbackErr) {
          console.error("Fallback endpoint also failed:", fallbackErr);
          setError("Failed to load membership data. Please try again.");
          setLoading(false);
          
          // Fallback to mock data
          console.log('Using fallback mock data');
          setUserData(MOCK_USER_DATA);
        }
      }
    };

    fetchUserData();
  }, []);

  // Setup base animations
  useEffect(() => {
    if (!userData) return;
    
    // Clear any existing animations
    if (cardTimeline.current) cardTimeline.current.kill();
    if (tierTimeline.current) tierTimeline.current.kill();
    
    // Initialize timelines
    cardTimeline.current = gsap.timeline();
    tierTimeline.current = gsap.timeline({ repeat: -1 });
    
    // Page fade in
    gsap.fromTo(
      pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );
    
    // Close button animation
    gsap.fromTo(
      closeButtonRef.current,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.5, delay: 0.3, ease: "back.out(1.7)" }
    );
    
    // Card entrance animation
    cardTimeline.current
      .fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
      )
      .fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.4"
      )
      .fromTo(
        badgeRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.3"
      )
      .fromTo(
        userInfoRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.2"
      );
    
    // Apply tier-specific animations
    applyTierAnimations(userData.membershipTier);
    
  }, [userData]);
  
  // Function to apply tier-specific animations
  const applyTierAnimations = (tier) => {
    // Clear previous tier animations
    if (tierTimeline.current) tierTimeline.current.clear();
    
    switch(tier) {
      case "gold":
        // Gold tier - Subtle shimmer effect
        tierTimeline.current
          .to(cardRef.current, {
            boxShadow: "0 15px 40px rgba(212, 175, 55, 0.5)",
            duration: 2,
            ease: "sine.inOut"
          })
          .to(cardRef.current, {
            boxShadow: "0 10px 30px rgba(212, 175, 55, 0.3)",
            duration: 2,
            ease: "sine.inOut"
          });
        
        // Badge glow
        gsap.to(badgeRef.current, {
          filter: "drop-shadow(0 0 8px rgba(212, 175, 55, 0.7))",
          repeat: -1,
          yoyo: true,
          duration: 1.5
        });
        break;
        
      case "diamond":
        // Diamond tier - Prismatic effect
        tierTimeline.current
          .to(cardRef.current, {
            boxShadow: "0 15px 40px rgba(185, 242, 255, 0.5)",
            duration: 2,
            ease: "sine.inOut"
          })
          .to(cardRef.current, {
            boxShadow: "0 10px 30px rgba(185, 242, 255, 0.3)",
            duration: 2,
            ease: "sine.inOut"
          });
        
        // Create shine effect
        const shineElement = document.createElement("div");
        shineElement.className = "shine-effect";
        cardRef.current.appendChild(shineElement);
        
        gsap.set(shineElement, {
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "50%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
          zIndex: 1,
          pointerEvents: "none"
        });
        
        gsap.to(shineElement, {
          left: "100%",
          duration: 3,
          repeat: -1,
          repeatDelay: 2,
          ease: "power2.inOut"
        });
        
        // Badge subtle rotation
        gsap.to(badgeRef.current, {
          rotation: 10,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        break;
        
      case "emerald":
        // Emerald tier - Breathing effect
        tierTimeline.current
          .to(cardRef.current, {
            scale: 1.02,
            boxShadow: "0 15px 40px rgba(80, 200, 120, 0.5)",
            duration: 2,
            ease: "sine.inOut"
          })
          .to(cardRef.current, {
            scale: 1,
            boxShadow: "0 10px 30px rgba(80, 200, 120, 0.3)",
            duration: 2,
            ease: "sine.inOut"
          });
        
        // Badge pulse
        gsap.to(badgeRef.current, {
          scale: 1.1,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        break;
        
      case "tropez":
        // Tropez tier - Premium 3D effect
        
        // Card subtle rotation on mouse move
        const card = cardRef.current;
        
        const handleMouseMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left; // x position within the element
          const y = e.clientY - rect.top; // y position within the element
          
          // Calculate rotation based on mouse position
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateY = ((x - centerX) / centerX) * 5; // Max 5 degrees
          const rotateX = ((centerY - y) / centerY) * 5; // Max 5 degrees
          
          gsap.to(card, {
            rotationY: rotateY,
            rotationX: rotateX,
            duration: 0.5,
            ease: "power1.out"
          });
        };
        
        const handleMouseLeave = () => {
          gsap.to(card, {
            rotationY: 0,
            rotationX: 0,
            duration: 0.5,
            ease: "power1.out"
          });
        };
        
        card.addEventListener("mousemove", handleMouseMove);
        card.addEventListener("mouseleave", handleMouseLeave);
        
        // Create multiple shine effects for Tropez
        for (let i = 0; i < 3; i++) {
          const shineElement = document.createElement("div");
          shineElement.className = `shine-effect shine-${i}`;
          card.appendChild(shineElement);
          
          gsap.set(shineElement, {
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "30%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            zIndex: 1,
            pointerEvents: "none",
            opacity: 0.7
          });
          
          gsap.to(shineElement, {
            left: "100%",
            duration: 3 + i,
            delay: i * 1.5,
            repeat: -1,
            repeatDelay: 1,
            ease: "power2.inOut"
          });
        }
        
        // Badge rotation
        gsap.to(badgeRef.current, {
          rotation: 360,
          duration: 10,
          repeat: -1,
          ease: "none"
        });
        
        // Cleanup function to remove event listeners
        return () => {
          card.removeEventListener("mousemove", handleMouseMove);
          card.removeEventListener("mouseleave", handleMouseLeave);
        };
        
      default:
        // Basic tier - subtle pulse
        tierTimeline.current
          .to(cardRef.current, {
            scale: 1.01,
            duration: 2,
            ease: "sine.inOut"
          })
          .to(cardRef.current, {
            scale: 1,
            duration: 2,
            ease: "sine.inOut"
          });
    }
  };

  const handleCloseCard = () => {
    // Animation for closing
    gsap.to(cardRef.current, {
      opacity: 0,
      y: 30,
      scale: 0.9,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        // Navigate to homepage after animation completes
        window.location.hash = "homePage";
      }
    });
  };

  // Show loading state
  if (loading) {
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
        </div>
      </div>
    );
  }

  // If we have no data and no error/loading state, don't render
  if (!userData) return null;

  return (
    <div id="membershipCardHolder" className="membership" ref={pageRef}>
      <div 
        className="membership-card__close" 
        id="closeCardBtn" 
        onClick={handleCloseCard}
        ref={closeButtonRef}
      >
        ×
      </div>

      <div 
        id="membershipCard" 
        data-badge={userData.membershipTier}
        ref={cardRef}
      >
        {/* Top Section of the Membership Card */}
        <div id="topCardSection">
          <span id="cardBadgeWrapper">
            <div 
              className={`badgeWrapper active`} 
              data-tier={userData.membershipTier}
            >
              <img 
                src={getBadgeImage(userData.membershipTier)} 
                alt={`${userData.membershipTier} badge`} 
              />
            </div>
          </span>

          <span id="cardLogo" ref={logoRef}>
            <img src={logoPlaceholder} alt="Cannipure logo" />
          </span>
        </div>

        {/* Bottom Section of the Membership Card */}
        <div id="bottomCardSection" ref={userInfoRef}>
          <div id="userName">
            <p>{`${userData.firstName} ${userData.last_name}`}</p>
            <p>{userData.cpNumber}</p>
            <p>Active for: <span className="days-count">{userData.activeDays}</span> days</p>
          </div>

          <div id="currentBadgeStatusWrapper">
            <img
              src={getBadgeImage(userData.membershipTier)}
              alt="Current membership badge"
              ref={badgeRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
