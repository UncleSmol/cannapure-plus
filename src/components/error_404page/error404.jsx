
import React from "react";
import "./error404.css";

export default function Error404() {
  return (
    <div id="page404" className="error-page">
      <div className="error-content">
        <h1 className="error-title">4<span className="error-zero">0</span>4</h1>
        <h2 className="error-subtitle">Page Not Found</h2>
        <p className="error-description">
          Oops! Looks like you've wandered into uncharted territory.
          The page you're looking for has gone up in smoke.
        </p>
        <div className="error-actions">
          <a href="#homePage" className="error-button">Go Home</a>
          <a href="#theBudBarPage" className="error-button error-button--outline">Visit Lab</a>
        </div>
      </div>
      <div className="error-decoration">
        <div className="error-leaf"></div>
      </div>
    </div>
  );
}
