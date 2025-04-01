import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./home.css"; // Import home styles

// Import the hero image directly
import heroImage from "../../assets/images/clipboard-image-4.png";

export default function HomePage() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const buttonsRef = useRef([]);
  const sectionsRef = useRef([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Handle image load error
  const handleImageError = () => {
    console.warn("Hero image failed to load, using CSS background fallback");
    setImageError(true);
  };

  useEffect(() => {
    // Hero Section Animation
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
    );

    // Title Animation (Ensure opacity ends at 1)
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power3.out" },
    );

    // Buttons Animation (Staggered, fully visible at end)
    gsap.fromTo(
      buttonsRef.current,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 0.5,
        delay: 0.5,
        ease: "power3.out",
      },
    );

    // Sections (Disclaimer & Store Hours) Animation
    gsap.fromTo(
      sectionsRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.3,
        duration: 0.8,
        delay: 0.6,
        ease: "power3.out",
      },
    );
  }, []);

  return (
    <section className="home-page">
      {/* Hero Section */}
      <section 
        className={`hero ${imageError ? 'hero--fallback' : ''}`} 
        ref={heroRef}
        style={imageError ? { backgroundImage: `url(${heroImage})` } : {}}
      >
        {/* Only render the img tag if we're not using the fallback */}
        {!imageError && (
          <img
            src={heroImage}
            alt="Cannapure hero"
            className={`hero__image ${imageLoaded ? 'hero__image--loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        <div className="hero__content">
          <h1 className="hero__title" ref={titleRef}>
            ELEVATE YOUR SENSES WITH QUALITY STRAINS
          </h1>
          <div className="hero__buttons">
            <a
              href="#theBudBarPage"
              className="hero__button"
              ref={(el) => (buttonsRef.current[0] = el)}
            >
              TO THE BUD BAR
            </a>
            <a
              href="#talkToUsPage"
              className="hero__button"
              ref={(el) => (buttonsRef.current[1] = el)}
            >
              TALK TO US
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section
        className="content-section disclaimer"
        ref={(el) => (sectionsRef.current[0] = el)}
      >
        <h1 className="section-title">DISCLAIMERS</h1>
        <div className="card-grid">
          <div className="glass-card">
            <p>
              Our products are for adult use only. Customers must be 18 years or
              older to purchase. Please consume responsibly.
            </p>
          </div>
          <div className="glass-card">
            <p>
              The products available at our stores are meticulously selected for
              quality and comply with local regulations.
            </p>
          </div>
          <div className="glass-card">
            <p>
              While our products are designed to enhance your lifestyle, we
              recommend consulting with healthcare professionals regarding any
              specific health concerns.
            </p>
          </div>
        </div>
      </section>

      {/* Store Hours Section */}
      <section
        className="content-section store-hours"
        ref={(el) => (sectionsRef.current[1] = el)}
      >
        <h1 className="section-title">OPERATIONAL HOURS</h1>
        <div className="card-grid">
          <div className="glass-card">
            <h2>Witbank</h2>
            <p>
              Monday to Saturday: 09:00 - 20:00
              <br />
              Sunday: 11:00 - 16:00
              <br />
              Public Holidays: Times may differ
            </p>
          </div>
          <div className="glass-card">
            <h2>Dullstroom</h2>
            <p>
              Monday to Saturday: 09:00 - 20:00
              <br />
              Sunday: 09:00 - 14:00
              <br />
              Public Holidays: Times may differ
            </p>
          </div>
          <div className="glass-card">
            <p>
              We invite you to visit our store to explore our products
              firsthand. Currently, we do not offer online sales or shipping
              services.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
