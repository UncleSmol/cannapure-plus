import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import "./header.css";

// Import the logo images directly
import logoImage from "../../assets/images/cannapure-plus-logo.png";
import signatureLogo from "../../sig/dev-doc-logo.svg";

const Header = () => {
  const location = useLocation();
  
  // State management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [signatureLoaded, setSignatureLoaded] = useState(false);
  const [signatureError, setSignatureError] = useState(false);

  // Refs
  const mobileNavRef = useRef(null);
  const hamburgerRef = useRef(null);
  const menuItemsRef = useRef([]);
  const overlayRef = useRef(null);
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const signatureRef = useRef(null);

  const menuItems = [
    {
      name: "HOME",
      icon: "https://www.svgrepo.com/show/535363/home.svg",
      to: "/",
    },
    {
      name: "BUD BAR",
      icon: "https://www.svgrepo.com/show/535344/flower.svg",
      to: "/theBudBarPage",
    },
    {
      name: "MEMBERSHIP",
      icon: "https://www.svgrepo.com/show/535331/crown.svg",
      to: "/membershipCardHolder",
    },
    {
      name: "TALK TO US",
      icon: "https://www.svgrepo.com/show/535320/comment-dots.svg",
      to: "/talkToUsPage",
    },
  ];

  // Handle scroll behavior
  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 0) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', controlHeader);
    return () => window.removeEventListener('scroll', controlHeader);
  }, [lastScrollY]);

  // Toggle mobile navigation with animations
  const toggleMobileNav = () => {
    const newMenuState = !mobileMenuOpen;
    setMobileMenuOpen(newMenuState);

    document.body.style.overflow = newMenuState ? "hidden" : "";

    if (overlayRef.current) {
      overlayRef.current.style.display = newMenuState ? "block" : "none";
    }

    if (newMenuState) {
      // Opening animations
      gsap.to(mobileNavRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power2.inOut",
      });
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
      });
      gsap.fromTo(
        menuItemsRef.current,
        { x: 20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.3,
        }
      );
    } else {
      // Closing animations
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
    }
  };

  const handleNavItemClick = () => {
    if (mobileMenuOpen) {
      toggleMobileNav();
    }
  };

  // Handle image loading
  const handleLogoLoad = () => setLogoLoaded(true);
  const handleLogoError = () => {
    console.warn("Mobile logo image failed to load");
    setLogoError(true);
  };
  const handleSignatureLoad = () => setSignatureLoaded(true);
  const handleSignatureError = () => {
    console.warn("Signature logo failed to load");
    setSignatureError(true);
  };

  return (
    <>
      <div
        ref={overlayRef}
        className={`overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={toggleMobileNav}
        style={{ display: "none", opacity: 0 }}
      ></div>

      <header 
        ref={headerRef} 
        className={`site-header ${isVisible ? 'header-visible' : 'header-hidden'}`}
      >
        <div className="site-header__logo">
          <h1 className="site-header__title">
            <Link to="/">CANNAPURE+</Link>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <ul className="site-header__nav">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`site-header__nav-item ${
                location.pathname === item.to ? "active" : ""
              }`}
            >
              <Link to={item.to}>{item.name}</Link>
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
          <div className="mobile-nav-wrapper">
            <ul className="mobile-nav__list">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className={`mobile-nav__item ${
                    location.pathname === item.to ? "active" : ""
                  }`}
                  ref={(el) => (menuItemsRef.current[index] = el)}
                  onClick={handleNavItemClick}
                >
                  <div className="mobile-nav__icon-wrapper">
                    <div className="mobile-nav__icon">
                      <Link to={item.to}>
                        <img src={item.icon} alt={`${item.name} Icon`} />
                      </Link>
                    </div>
                    <Link to={item.to} className="mobile-nav__text">
                      {item.name}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mobile-logo">
              <img 
                src={logoImage} 
                alt="Cannapure Plus Logo"
                className={`mobile-logo__image ${logoLoaded ? 'mobile-logo__image--loaded' : ''}`}
                onLoad={handleLogoLoad}
                onError={handleLogoError}
                ref={logoRef}
              />
            </div>
          
            <div className="signature-logo">
              <a 
                href="https://unclesmol.github.io/dev-doc/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="signature-logo__link"
              >
                <img 
                  src={signatureLogo} 
                  alt="Developer Signature"
                  className={`signature-logo__image ${signatureLoaded ? 'signature-logo__image--loaded' : ''}`}
                  onLoad={handleSignatureLoad}
                  onError={handleSignatureError}
                  ref={signatureRef}
                />
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
