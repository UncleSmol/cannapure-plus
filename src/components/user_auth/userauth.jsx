import React, { useState, useEffect, useRef } from "react";
import { validateUserData } from "./validateUserData";
import { gsap } from "gsap";
import { useAuth } from "../../context/AuthProvider";
import "./userauth.css";

export default function UserAuth() {
  const { login, register, isAuthenticated, loading, error, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    cpNumber: ""
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
  const [feedbackMessage, setFeedbackMessage] = useState({ type: "", message: "" });
  const errorRefs = useRef({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      window.location.hash = "homePage";
    }
  }, [isAuthenticated]);

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

  // Clear feedback when changing tabs
  useEffect(() => {
    setFeedbackMessage({ type: "", message: "" });
    if (error) {
      clearError();
    }
  }, [activeTab, error, clearError]);

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

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    
    // Clear global error from auth context if present
    if (error) {
      clearError();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
    
    // Clear global error from auth context if present
    if (error) {
      clearError();
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMessage({ type: "", message: "" });

    try {
      console.log('Attempting login with:', { 
        email: loginData.email,
        password: loginData.password ? '********' : '',
        cpNumber: loginData.cpNumber || undefined
      });
      
      // Call the login function with the correct parameters
      const result = await login(loginData);
      
      console.log('Login result:', result);
      
      if (!result.success && result.error) {
        setFeedbackMessage({ 
          type: "error", 
          message: typeof result.error === 'string' 
            ? result.error 
            : "Login failed. Please check your credentials."
        });
      }
      // On success, the useEffect with isAuthenticated will redirect
    } catch (error) {
      console.error("Login error:", error);
      
      // Get a proper error message
      const errorMessage = error.message || "An unexpected error occurred. Please try again.";
      
      setFeedbackMessage({ 
        type: "error", 
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const validationResult = validateUserData(userData);
    setErrors(validationResult.errors);
    
    // Don't proceed if there are validation errors
    if (Object.keys(validationResult.errors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    setFeedbackMessage({ type: "", message: "" });
    
    try {
      // Transform userData to match the expected format by the backend
      const registrationData = {
        // Use the field names that match the backend requirements
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone_number: userData.phoneNumber,
        id_number: userData.idNumber,
        address: userData.address,
        cpNumber: userData.cpNumber || undefined
      };
      
      console.log('Submitting registration data:', { 
        ...registrationData, 
        password: '********' 
      });
      
      const result = await register(registrationData);
      
      if (result.success) {
        setFeedbackMessage({
          type: "success",
          message: "Registration successful! You can now login."
        });
        
        // Clear the form
        setUserData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          idNumber: "",
          address: "",
          password: "",
        });
        
        // Switch to login tab after a short delay
        setTimeout(() => {
          setActiveTab("login");
        }, 2000);
      } else {
        setFeedbackMessage({
          type: "error",
          message: result.error || "Registration failed. Please try again."
        });
      }
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        message: "An unexpected error occurred. Please try again."
      });
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
          
          {(feedbackMessage.message || error) && activeTab === "login" && (
            <div className={`auth-feedback ${feedbackMessage.type || "error"}`}>
              {feedbackMessage.message || error}
            </div>
          )}
          
          <form id="loginForm" className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
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
              <label htmlFor="cpNumber" className="form-label">
                CP / CPD Number
              </label>
              <input
                type="text"
                id="cpNumber"
                name="cpNumber"
                className="form-control"
                placeholder="Enter your CP/CPD number (if applicable)"
                value={loginData.cpNumber}
                onChange={handleLoginInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleLoginInputChange}
                required
                autoComplete="current-password"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary auth-btn"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="auth-links">
            <button className="forgot-password">
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <div
          id="registerFormContainer"
          className={`auth-form-container ${activeTab !== "register" ? "hidden" : ""}`}
        >
          <h1 className="auth-title">Member Registration</h1>
          
          {(feedbackMessage.message || error) && activeTab === "register" && (
            <div className={`auth-feedback ${feedbackMessage.type || "error"}`}>
              {feedbackMessage.message || error}
            </div>
          )}
          
          <form id="registerForm" className="auth-form" onSubmit={handleRegisterSubmit}>
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
                <div className="error-message" ref={el => errorRefs.current.firstName = el}>
                  {errors.firstName}
                </div>
              )}
            </div>

            {/* Last Name Field */}
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={`form-control ${errors.lastName ? "error" : ""}`}
                placeholder="Enter your last name"
                value={userData.lastName}
                onChange={handleInputChange}
                required
              />
              {errors.lastName && (
                <div className="error-message" ref={el => errorRefs.current.lastName = el}>
                  {errors.lastName}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="regEmail" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="regEmail"
                name="email"
                className={`form-control ${errors.email ? "error" : ""}`}
                placeholder="Enter your email"
                value={userData.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && (
                <div className="error-message" ref={el => errorRefs.current.email = el}>
                  {errors.email}
                </div>
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
                <div className="error-message" ref={el => errorRefs.current.phoneNumber = el}>
                  {errors.phoneNumber}
                </div>
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
                <div className="error-message" ref={el => errorRefs.current.idNumber = el}>
                  {errors.idNumber}
                </div>
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
                <div className="error-message" ref={el => errorRefs.current.address = el}>
                  {errors.address}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="regPassword" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="regPassword"
                name="password"
                className={`form-control ${errors.password ? "error" : ""}`}
                placeholder="Enter your password"
                value={userData.password}
                onChange={handleInputChange}
                required
              />
              {errors.password && (
                <div className="error-message" ref={el => errorRefs.current.password = el}>
                  {errors.password}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary auth-btn"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
