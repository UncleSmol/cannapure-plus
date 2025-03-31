import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useAuth } from "../../context/AuthProvider";
import "./header.css";

const Header = ({ currentPage }) => {
  const { isAuthenticated, logout, user } = useAuth();
  
  // Log authentication state for debugging
  useEffect(() => {
    console.log("Header auth state:", { isAuthenticated, user });
  }, [isAuthenticated, user]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mobileNavRef = useRef(null);
  const hamburgerRef = useRef(null);
  const menuItemsRef = useRef([]);
  const overlayRef = useRef(null);
  const headerRef = useRef(null);

  // Handle logout with error handling
  const handleLogout = async () => {
    console.log("Logout button clicked");
    try {
      await logout();
      console.log("Logout successful");
      window.location.hash = "homePage";
      handleNavItemClick(); // Close mobile menu if open
    } catch (error) {
      console.error("Logout failed:", error);
      // Show error to user if needed
    }
  };

  // Menu items data - first 4 items that are always shown
  const baseMenuItems = [
    {
      name: "HOME",
      icon: "https://www.svgrepo.com/show/535437/home.svg",
      link: "#homePage",
    },
    {
      name: "THE BUD BAR",
      icon: "https://www.svgrepo.com/show/535332/cube.svg",
      link: "#theBudBarPage",
    },
    {
      name: "MEMBERSHIP",
      icon: "https://www.svgrepo.com/show/535331/crown.svg",
      link: "#membershipCardHolder",
    },
    {
      name: "TALK TO US",
      icon: "https://www.svgrepo.com/show/535320/comment-dots.svg",
      link: "#talkToUsPage",
    },
  ];

  // Conditionally add login or logout based on authentication status
  const menuItems = [
    ...baseMenuItems,
    isAuthenticated
      ? {
          name: "LOGOUT",
          icon: "https://www.svgrepo.com/show/535364/door-open.svg",
          action: handleLogout,
        }
      : {
          name: "LOGIN/REGISTER",
          icon: "https://www.svgrepo.com/show/535362/door.svg",
          link: "#userAuthenticationPage",
        },
  ];

  // Initial header animation
  useEffect(() => {
    gsap.from(".site-header", {
    
      // opacity: 0.8,
      duration: 0.3,
      ease: "power2.out",
    });
  }, []);
  
  // Handle scroll behavior
  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 0) {
        // At the top of the page, always show header
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up, show header
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down and not at the top, hide header
        // Only hide after scrolling down a bit (50px)
        setIsVisible(false);
      }
      
      // Remember current scroll position for next comparison
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', controlHeader);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY]);

  // Toggle mobile navigation with animations
  const toggleMobileNav = () => {
    const newMenuState = !mobileMenuOpen;
    setMobileMenuOpen(newMenuState);

    // Toggle body scroll
    document.body.style.overflow = newMenuState ? "hidden" : "";

    if (!newMenuState) {
      // Closing animation
      gsap.to(mobileNavRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.display = "none";
          }
        },
      });
      gsap.to(menuItemsRef.current, {
        x: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.3,
      });
    } else {
      // Opening animation
      if (overlayRef.current) {
        overlayRef.current.style.display = "block";
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
        });
      }

      gsap.fromTo(
        mobileNavRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.inOut" },
      );

      gsap.fromTo(
        menuItemsRef.current,
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.15, duration: 0.5 },
      );
    }
  };

  const handleNavItemClick = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = "";

    // Properly hide the overlay
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.display = "none";
          }
        },
      });
    }
  };

  return (
    <>
      {/* Overlay for mobile menu */}
      <div
        ref={overlayRef}
        className={`overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={toggleMobileNav}
        style={{ display: "none", opacity: 0 }}
      ></div>

      <header 
        ref={headerRef} 
        className={`site-header ${isVisible ? 'header-visible' : 'header-hidden'}`}>
        {/* Logo */}
        <div className="site-header__logo">
          <h1 className="site-header__title">
            <a href="#homePage">CANNAPURE+</a>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <ul className="site-header__nav">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`site-header__nav-item ${
                item.link && currentPage === item.link.substring(1) ? "active" : ""
              }`}
            >
              {item.action ? (
                <button onClick={item.action} className="logout-button">
                  {item.name}
                </button>
              ) : (
                <a href={item.link}>{item.name}</a>
              )}
            </li>
          ))}
        </ul>

        {/* Hamburger Menu */}
        <div
          className={`hamburger-menu ${mobileMenuOpen ? "is-active" : ""}`}
          onClick={toggleMobileNav}
          ref={hamburgerRef}
        >
          <span className="hamburger-menu__line"></span>
          <span className="hamburger-menu__line"></span>
          <span className="hamburger-menu__line"></span>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`mobile-nav ${mobileMenuOpen ? "menu-active" : ""}`}
          ref={mobileNavRef}
        >
          <ul className="mobile-nav__list">
            {menuItems.map((item, index) => (
              <li
                key={index}
                className={`mobile-nav__item ${
                  item.link && currentPage === item.link.substring(1) ? "active" : ""
                }`}
                ref={(el) => (menuItemsRef.current[index] = el)}
                onClick={item.action ? item.action : handleNavItemClick}
              >
                <div className="mobile-nav__icon-wrapper">
                  <div className="mobile-nav__icon">
                    {item.action ? (
                      <button className="icon-button">
                        <img src={item.icon} alt={`${item.name} Icon`} />
                      </button>
                    ) : (
                      <a href={item.link}>
                        <img src={item.icon} alt={`${item.name} Icon`} />
                      </a>
                    )}
                  </div>
                  {item.action ? (
                    <button className="mobile-nav__text logout-button">
                      {item.name}
                    </button>
                  ) : (
                    <a href={item.link} className="mobile-nav__text">
                      {item.name}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mobile-logo">
            <img src="./src/assets/images/cannapure-plus-logo.png" alt="" />
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
