import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from '../../context/AuthContext';
import "./header.css";

// Import the logo images directly
import logoImage from "../../assets/images/cannapure-plus-logo.png";
import signatureLogo from "../../sig/dev-doc-logo.svg";

const Header = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  console.log('Auth state in header:', { isAuthenticated }); // Debug log

  // State management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [signatureLoaded, setSignatureLoaded] = useState(false);

  // Refs
  const mobileNavRef = useRef(null);
  const hamburgerRef = useRef(null);
  const menuItemsRef = useRef([]);
  const overlayRef = useRef(null);
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const signatureRef = useRef(null);

  const handleAuthClick = async () => {
    console.log('Auth button clicked, current state:', { isAuthenticated }); // Debug log

    if (isAuthenticated) {
      try {
        console.log('Attempting logout...'); // Debug log
        await logout();
        console.log('Logout successful'); // Debug log
        setMobileMenuOpen(false); // Close mobile menu after logout
      } catch (error) {
        console.error('Logout failed:', error);
      }
    } else {
      navigate('/auth');
      setMobileMenuOpen(false);
    }
  };

  const menuItems = [
    {
      name: "HOME",
      icon: "https://www.svgrepo.com/show/535437/home.svg",
      to: "/",
    },
    {
      name: "BUD BAR",
      icon: "https://www.svgrepo.com/show/282812/cannabis-marijuana.svg",
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
    {
      name: isAuthenticated ? "LOGOUT" : "LOGIN",
      icon: "https://www.svgrepo.com/show/146318/user-login-button.svg",
      isAuth: true,
      onClick: handleAuthClick
    }
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
  };
  const handleSignatureLoad = () => setSignatureLoaded(true);
  const handleSignatureError = () => {
    console.warn("Signature logo failed to load");
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
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.to) {
                      navigate(item.to);
                    }
                    handleNavItemClick();
                  }}
                >
                  <div className="mobile-nav__icon-wrapper">
                    <div className={`mobile-nav__icon ${item.isAuth && isAuthenticated ? 'logged-in' : ''}`}>
                      <img 
                        src={item.icon} 
                        alt={`${item.name} Icon`} 
                        style={{ transition: 'transform 0.3s ease' }}
                      />
                    </div>
                    <span className="mobile-nav__text">{item.name}</span>
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

        <button onClick={handleAuthClick} className="auth-link">
          <span className={`auth-icon ${isAuthenticated ? 'logged-in' : ''}`}>
            <i className="fas fa-user-circle"></i>
          </span>
          <span className="auth-text">{isAuthenticated ? 'LOGOUT' : 'LOGIN'}</span>
        </button>
      </header>
    </>
  );
};

export default Header;
