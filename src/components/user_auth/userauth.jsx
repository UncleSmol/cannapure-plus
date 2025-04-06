import React, { useState, useEffect, useRef, useCallback } from "react";
import { validateUserData } from "./validateUserData";
import { useAuthNotification } from "../../hooks/useAuthNotification";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import "./userauth.css";

export default function UserAuth() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    cpdNumber: ""
  });
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    idNumber: "",
    address: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const errorRefs = useRef({});
  const navigate = useNavigate();
  const { login, register } = useAuthNotification();

  // Add handleClick function
  const handleClick = useCallback(() => {
    // Handle forgot password or other click actions
    console.log('Auth link clicked');
    // Add your click handling logic here
  }, []);

  // GSAP Animation Setup
  useEffect(() => {
    Object.keys(errorRefs.current).forEach((key) => {
      gsap.set(errorRefs.current[key], {
        opacity: 0,
        height: 0,
        marginTop: 0,
      });
    });
  }, []);

  const animateError = (fieldName, show) => {
    const element = errorRefs.current[fieldName];
    if (!element) return;

    gsap.to(element, {
      opacity: show ? 1 : 0,
      height: show ? "auto" : 0,
      marginTop: show ? "0.5rem" : 0,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  // Real-time Validation
  const validateField = (name, value) => {
    const fieldErrors = validateUserData({ [name]: value }).errors;
    const isValid = !fieldErrors[name];

    animateError(name, !isValid);
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] || null }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors } = validateUserData(userData);
    setErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await register({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          idNumber: userData.idNumber,
          address: userData.address
        });
        
        if (response.success) {
          navigate('/');
        }
      } catch (error) {
        setErrors({ register: error.message });
      }
    }
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login({
        email: loginData.email,
        password: loginData.password,
        cpNumber: loginData.cpdNumber
      });
      // Navigate to home page on successful login
      navigate('/');
    } catch (error) {
      setErrors({ login: error.message });
    }
  };

  // Handle login form input changes
  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div id="userAuthenticationPage" className="user-auth-page">
      <div className="auth-container">
        <div className="auth-tabs">
          <button
            id="loginTab"
            className={`auth-tab ${activeTab === "login" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            id="registerTab"
            className={`auth-tab ${activeTab === "register" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        <div
          id="loginFormContainer"
          className={`auth-form-container ${activeTab !== "login" ? "hidden" : ""}`}
        >
          <h1 className="auth-title">Member Login</h1>
          <form id="loginForm" className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="loginEmail" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="loginEmail"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={handleLoginInputChange}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="cpdNumber" className="form-label">
                CP / CPD Number
              </label>
              <input
                type="text"
                id="cpdNumber"
                name="cpdNumber"
                className="form-control"
                placeholder="Enter your CP/CPD number"
                value={loginData.cpdNumber}
                onChange={handleLoginInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="loginPassword" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="loginPassword"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleLoginInputChange}
                required
                autoComplete="current-password"
              />
            </div>
            {errors.login && (
              <div className="error-message">{errors.login}</div>
            )}
            <button type="submit" className="btn btn-primary auth-btn">
              Login
            </button>
          </form>
          <div className="auth-links">
            <button
              type="button" // Add type="button" to prevent form submission
              onClick={handleClick}
              className="auth-link-btn"
              style={{ cursor: "pointer" }}
            >
              Click here
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <div
          id="registerFormContainer"
          className={`auth-form-container ${activeTab !== "register" ? "hidden" : ""}`}
        >
          <h1 className="auth-title">Member Registration</h1>
          <form id="registerForm" className="auth-form" onSubmit={handleSubmit}>
            {/* First Name Field */}
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={`form-control ${errors.firstName ? "error" : ""}`}
                placeholder="Enter your first name"
                value={userData.firstName}
                onChange={handleInputChange}
                required
              />
              {errors.firstName && (
                <div className="error-message">{errors.firstName}</div>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="registerEmail" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="registerEmail"
                name="email"
                className={`form-control ${errors.email ? "error" : ""}`}
                placeholder="Enter your email"
                value={userData.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className={`form-control ${errors.phoneNumber ? "error" : ""}`}
                placeholder="Enter your phone number"
                value={userData.phoneNumber}
                onChange={handleInputChange}
                required
              />
              {errors.phoneNumber && (
                <div className="error-message">{errors.phoneNumber}</div>
              )}
            </div>

            {/* ID Number Field */}
            <div className="form-group">
              <label htmlFor="idNumber" className="form-label">
                ID Number
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                className={`form-control ${errors.idNumber ? "error" : ""}`}
                placeholder="Enter your ID number"
                value={userData.idNumber}
                onChange={handleInputChange}
                required
              />
              {errors.idNumber && (
                <div className="error-message">{errors.idNumber}</div>
              )}
            </div>

            {/* Address Field */}
            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Residential Address
              </label>
              <textarea
                id="address"
                name="address"
                className={`form-control ${errors.address ? "error" : ""}`}
                placeholder="Enter your address"
                value={userData.address}
                onChange={handleInputChange}
                required
              ></textarea>
              {errors.address && (
                <div className="error-message">{errors.address}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="registerPassword" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="registerPassword"
                name="password"
                className={`form-control ${errors.password ? "error" : ""}`}
                placeholder="Enter your password"
                value={userData.password}
                onChange={handleInputChange}
                required
              />
              {errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary auth-btn">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
