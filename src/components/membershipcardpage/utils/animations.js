import { gsap } from "gsap";

/**
 * Applies tier-specific animations to the membership card
 * @param {string} tier - The membership tier (basic, gold, diamond, emerald, tropez)
 * @param {Object} refs - Object containing refs to DOM elements
 * @param {Object} refs.cardRef - Reference to the card element
 * @param {Object} refs.badgeRef - Reference to the badge element
 * @returns {Function} Cleanup function for animations and event listeners
 */
export const applyTierAnimations = (tier, { cardRef, badgeRef }) => {
  if (!cardRef?.current) return () => {}; // Return empty function if no card ref

  // Ensure card is visible
  gsap.set(cardRef.current, { opacity: 1 });
  
  // Create timeline for animations
  const tierTimeline = gsap.timeline({ repeat: -1 });
  
  // Clear any existing animations on the elements
  gsap.killTweensOf(cardRef.current);
  if (badgeRef?.current) {
    gsap.killTweensOf(badgeRef.current);
  }
  
  // Remove any previously added shine effects
  const existingShineEffects = cardRef.current.querySelectorAll('.shine-effect');
  existingShineEffects.forEach(el => el.remove());
  
  // Store event handlers for cleanup
  let handleMouseMove;
  let handleMouseLeave;
  
  switch(tier) {
    case "gold":
      // Gold tier - Subtle shimmer effect
      tierTimeline
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
      if (badgeRef?.current) {
        gsap.to(badgeRef.current, {
          filter: "drop-shadow(0 0 8px rgba(212, 175, 55, 0.7))",
          repeat: -1,
          yoyo: true,
          duration: 1.5
        });
      }
      break;
      
    case "diamond":
      // Diamond tier - Prismatic effect
      tierTimeline
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
      if (badgeRef?.current) {
        gsap.to(badgeRef.current, {
          rotation: 10,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
      break;
      
    case "emerald":
      // Emerald tier - Breathing effect
      tierTimeline
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
      if (badgeRef?.current) {
        gsap.to(badgeRef.current, {
          scale: 1.1,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
      break;
      
    case "tropez":
      // Tropez tier - Premium 3D effect
      
      // Card subtle rotation on mouse move
      const card = cardRef.current;
      
      handleMouseMove = (e) => {
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
      
      handleMouseLeave = () => {
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
      if (badgeRef?.current) {
        gsap.to(badgeRef.current, {
          rotation: 360,
          duration: 10,
          repeat: -1,
          ease: "none"
        });
      }
      break;
      
    default:
      // Basic tier - subtle pulse
      tierTimeline
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
  
  // Return a unified cleanup function for all tiers
  return () => {
    // Kill any remaining GSAP animations
    if (cardRef?.current) {
      gsap.killTweensOf(cardRef.current);
    }
    
    if (badgeRef?.current) {
      gsap.killTweensOf(badgeRef.current);
    }
    
    // Kill timeline
    if (tierTimeline) {
      tierTimeline.kill();
    }
    
    // Remove event listeners for Tropez tier
    if (handleMouseMove && handleMouseLeave && cardRef?.current) {
      cardRef.current.removeEventListener("mousemove", handleMouseMove);
      cardRef.current.removeEventListener("mouseleave", handleMouseLeave);
    }
    
    // Remove any shine effects
    if (cardRef?.current) {
      const existingShineEffects = cardRef.current.querySelectorAll('.shine-effect');
      existingShineEffects.forEach(el => el.remove());
    }
  };
};

/**
 * Applies entrance animations to the membership card and its elements
 * @param {Object} refs - Object containing refs to DOM elements
 * @returns {Function} Cleanup function for entrance animations
 */
export const applyEntranceAnimations = (refs) => {
  const { 
    pageRef, 
    cardRef, 
    logoRef, 
    badgeRef, 
    userInfoRef, 
    tierInfoRef, 
    infoPanelsRef,
    closeButtonRef
  } = refs;
  
  // Create timeline for card entrance
  const cardTimeline = gsap.timeline();
  
  // Page fade in
  if (pageRef?.current) {
    gsap.fromTo(
      pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }
  
  // Close button animation
  if (closeButtonRef?.current) {
    gsap.fromTo(
      closeButtonRef.current,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.5, delay: 0.3, ease: "back.out(1.7)" }
    );
  }
  
  // Card entrance animation
  if (cardRef?.current) {
    cardTimeline
      .fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)", onComplete: () =>{
          gsap.set(cardRef.current, { opacity: 1 });
        } }
      );
    
    if (logoRef?.current) {
      cardTimeline.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.4"
      );
    }
    
    if (badgeRef?.current) {
      cardTimeline.fromTo(
        badgeRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.3"
      );
    }
    
    if (userInfoRef?.current) {
      cardTimeline.fromTo(
        userInfoRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.2"
      );
    }
    
    if (tierInfoRef?.current) {
      cardTimeline.fromTo(
        tierInfoRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "-=0.1"
      );
    }
    
    // Info panels animation
    if (infoPanelsRef?.current) {
      cardTimeline.fromTo(
        infoPanelsRef.current.children,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.1,
          ease: "power2.out" 
        },
        "-=0.2"
      );
    }
  }
  
  // Return a cleanup function
  return () => {
    // Clean up entrance animations
    if (cardTimeline) {
      cardTimeline.kill();
    }
  };
};

/**
 * Animates the card closing and handles navigation
 * @param {Object} cardRef - Reference to the card element
 * @param {Function} onComplete - Function to call when animation completes
 */
export const animateCardClose = (cardRef, onComplete = () => {}) => {
  if (cardRef?.current) {
    gsap.to(cardRef.current, {
      opacity: 0,
      y: 30,
      scale: 0.9,
      duration: 0.5,
      ease: "power2.in",
      onComplete
    });
  } else {
    onComplete();
  }
};
