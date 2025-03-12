import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import "./membership.css";

export default function MembershipCardHolder() {
  const pageRef = useRef(null);
  const cardRef = useRef(null);
  const [userData] = useState({
    firstName: "John",
    surname: "Doe",
    cpNumber: "CP123456",
    activeDays: 30,
    membershipTier: "tropez" // Options: gold, diamond, emerald, tropez
  });

  useEffect(() => {
    // Page Animation
    gsap.fromTo(
      pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );

    // Card Animation
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.8, 
        delay: 0.3, 
        ease: "back.out(1.7)" 
      }
    );
    // Conditional Animations Based on Membership Tier
    if (userData.membershipTier === "gold") {
      // Gold tier - Subtle shimmer with particle effects
      gsap.to(cardRef.current, {
        backgroundImage: "linear-gradient(45deg, #FFD700 0%, #FFF5E1 50%, #FFD700 100%)",
        backgroundSize: "200% 200%",
        duration: 3,
        repeat: -1,
        ease: "none"
      });
    } else if (userData.membershipTier === "diamond") {
      // Diamond tier - 3D rotation with prismatic effects
      gsap.to(cardRef.current, {
        rotationY: 10,
        rotationX: 5,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        backgroundImage: "linear-gradient(135deg, #A9F8F9 0%, #E2F3F5 50%, #A9F8F9 100%)",
      });
    } else if (userData.membershipTier === "emerald") {
      // Emerald tier - Morphing background with floating elements
      gsap.to(cardRef.current, {
        backgroundImage: "linear-gradient(45deg, #50C878 0%, #3CB371 50%, #50C878 100%)",
        boxShadow: "0 0 30px rgba(80, 200, 120, 0.5)",
        scale: 1.02,
        duration: 2,
        yoyo: true,
        repeat: -1
      });
    } else if (userData.membershipTier === "tropez") {
      // Tropez tier dynamic gradient animation or a flip on hover
      gsap.to(cardRef.current, {
        rotationY: 360,
        duration: 5,
        ease: "power1.inOut"
      });
    }
  }, [userData.membershipTier]);

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

  return (
    <div id="membershipCardHolder" className="membership" ref={pageRef}>
      <div className="membership-card__close" id="closeCardBtn" onClick={handleCloseCard}>×</div>

      <div 
        id="membershipCard" 
        data-badge={userData.membershipTier}
        ref={cardRef}
      >
        {/* Top Section of the Membership Card */}
        <div id="topCardSection">
          <span id="cardBadgeWrapper">
            <div className={`badgeWrapper ${userData.membershipTier === 'gold' ? 'active' : ''}`}>
              <img src="./assets/img/cannipure-logo.png" alt="gold badge" />
            </div>
            <div className={`badgeWrapper ${userData.membershipTier === 'diamond' ? 'active' : ''}`}>
              <img src="./assets/img/cannipure-logo.png" alt="diamond badge" />
            </div>
            <div className={`badgeWrapper ${userData.membershipTier === 'emerald' ? 'active' : ''}`}>
              <img src="./assets/img/cannipure-logo.png" alt="emerald badge" />
            </div>
            <div className={`badgeWrapper ${userData.membershipTier === 'tropez' ? 'active' : ''}`}>
              <img src="./assets/img/cannipure-logo.png" alt="tropez badge" />
            </div>
          </span>

          <span id="cardLogo">
            <img src="./assets/img/cannipure-logo.png" alt="card logo" />
          </span>
        </div>

        {/* Bottom Section of the Membership Card */}
        <div id="bottomCardSection">
          <span id="userName">
            <p>{`${userData.firstName} ${userData.surname}`}</p>
            <p>{userData.cpNumber}</p>
            <p>Active for: <span className="days-count">{userData.activeDays}</span> days</p>
          </span>
          <span id="currentBadgeStatusWrapper">
            <img src="./assets/img/cannipure-logo.png" alt="current badge" />
          </span>
        </div>
      </div>
    </div>
  );
}
