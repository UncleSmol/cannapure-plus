import React, { useState } from "react";
import "./talktous.css";

export default function TalkToUs() {
  const [selectedLocation, setSelectedLocation] = useState("Witbank");

  const maps = {
    Witbank:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.789012345678!2d29.209876!3d-25.874321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e95765c12345678%3A0xabcdef1234567890!2s2%20Frans%20St%2C%20Fransville%2C%20eMalahleni%2C%201034%2C%20South%20Africa!5e0!3m2!1sen!2sza!4v1617282800000!5m2!1sen!2sza",
    Dullstroom:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.123456789012!2d30.112233!3d-25.993322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e8d6e7c12345678%3A0x123456789abcdef!2sDullstroom%2C%20South%20Africa!5e0!3m2!1sen!2sza!4v1617282900000!5m2!1sen!2sza"
  };

  return (
    <div id="talkToUsPage" className="talk-to-us-page">
      {/* Hero Section */}
      <div className="talk-to-us__hero">
        <h1 className="talk-to-us__title">LET'S CONNECT</h1>
        <p className="talk-to-us__subtitle">Quick and easy ways to reach us</p>
      </div>

      {/* Contact Methods Grid */}
      <div className="talk-to-us__methods">
        {/* WhatsApp */}
        <div className="contact-method">
          <div className="contact-method__icon">
            <img
              src="https://static.vecteezy.com/system/resources/thumbnails/022/493/580/small_2x/3d-render-whatsapp-logo-icon-isolated-on-transparent-background-free-png.png"
              alt="WhatsApp"
            />
          </div>
          <h2 className="contact-method__title">WhatsApp</h2>
          <p className="contact-method__description">Fastest way to reach us</p>
          <a
            href="https://wa.me/0647513912"
            className="contact-method__button"
          >
            Chat Now
          </a>
        </div>

        {/* Facebook */}
        <div className="contact-method">
          <div className="contact-method__icon">
            <img
              src="https://static.vecteezy.com/system/resources/previews/022/488/746/original/3d-render-facebook-logo-icon-isolated-on-transparent-background-free-png.png"
              alt="Facebook"
            />
          </div>
          <h2 className="contact-method__title">Facebook</h2>
          <p className="contact-method__description">
            Find our page and connect with us through our content
          </p>
          <a
            href="https://www.facebook.com/profile.php?id=61560386257540"
            className="contact-method__button"
          >
            Message Us
          </a>
        </div>
      </div>

      {/* Quick FAQ Section */}
      <div className="talk-to-us__faq">
        <h2 className="faq__title">QUICK ANSWERS</h2>
        <div className="faq__grid">
          {/* FAQ Item 1 */}
          <div className="faq__item">
            <h3 className="faq__question">How do I become a member?</h3>
            <p className="faq__answer">
              Visit our store with valid ID. Our staff will guide you through the
              quick membership process.
            </p>
          </div>

          {/* FAQ Item 2 */}
          <div className="faq__item">
            <h3 className="faq__question">What are your store hours?</h3>
            <p className="faq__answer">
              Monday to Saturday: 8 AM - 8 PM
              <br />
              Sunday: 8 AM - 5 PM
            </p>
          </div>

          {/* FAQ Item 3 */}
          <div className="faq__item">
            <h3 className="faq__question">Do you offer delivery?</h3>
            <p className="faq__answer">
              We are an in-store only establishment. Visit us to explore our full
              range of products.
            </p>
          </div>

          {/* FAQ Item 4 */}
          <div className="faq__item">
            <h3 className="faq__question">What payment methods do you accept?</h3>
            <p className="faq__answer">
              We accept cash and major credit cards in store.
            </p>
          </div>
        </div>
      </div>

      {/* Location Hours Banner */}
      <div className="talk-to-us__location">
        <div className="location__content">
          <div className="location__hours">
            <h2 className="hours__title">OPERATIONAL HOURS</h2>
            <div className="hours__location">
              <h3>Witbank</h3>
              <p className="hours__text">MON-SAT: 09:00 - 20:00</p>
              <p className="hours__text">SUN: 11:00 - 16:00</p>
              <p className="hours__text">Public Holidays: Times may differ</p>
            </div>
            <div className="hours__location">
              <h3>Dullstroom</h3>
              <p className="hours__text">MON-SAT: 09:00 - 20:00</p>
              <p className="hours__text">SUN: 09:00 - 14:00</p>
              <p className="hours__text">Public Holidays: Times may differ</p>
            </div>
          </div>
          <div className="location__address">
            <h2 className="address__title">FIND US</h2>
            <p className="address__text">
              Visit us in one of our stores for the full experience
            </p>
            <div className="map-filter">
              <button
                id="witbankBtn"
                className={`map-filter__btn ${
                  selectedLocation === "Witbank" ? "active" : ""
                }`}
                onClick={() => setSelectedLocation("Witbank")}
              >
                Witbank
              </button>
              <button
                id="dullstroomBtn"
                className={`map-filter__btn ${
                  selectedLocation === "Dullstroom" ? "active" : ""
                }`}
                onClick={() => setSelectedLocation("Dullstroom")}
              >
                Dullstroom
              </button>
            </div>
            <div id="map" className="map-container">
              <iframe
                src={maps[selectedLocation]}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Google Maps"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
