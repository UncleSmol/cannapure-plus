import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import axios from "axios";
import "./auth.css";
import { 
  sanitizeLoginData, 
  sanitizeRegisterData, 
  validateLoginData,
  validateRegistrationData,
  validateRegistrationField,
  validateLoginField,
  getFieldRequirements
} from "./sanitize";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// API base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Simple field requirement hint component
const FieldRequirementHints = ({ requirements = [], status = [], visible = false }) => {
  if (!visible || requirements.length === 0) {
    return null;
  }

  return (
    <div className="field-requirements">
      <ul>
        {requirements.map((requirement, index) => (
          <li key={index} className={`requirement-item ${status[index] || ''}`}>
            <span className="requirement-indicator">
              {status[index] === 'valid' ? '✓' : '○'}
            </span>
            <span className="requirement-text">{requirement}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Component refs for animations
  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const formContainerRef = useRef(null);
  const loginFormRef = useRef(null);
  const registerFormRef = useRef(null);
  
  // State for form mode (login or register)
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data states - aligned with database field names
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    cpNumber: '' // Added cpNumber for login
  });
  
  const [registerData, setRegisterData] = useState({
    id_number: '',
    first_name: '',
    last_name: '',
    surname: '',
    email: '',
    phone_number: '',
    address: '',
    password: '',
    confirmPassword: '', // Not in database but needed for validation
    cpNumber: '' // Added cpNumber for registration
  });
  
  // Form error states
  const [loginError, setLoginError] = useState(null);
  const [loginFieldErrors, setLoginFieldErrors] = useState({});
  const [loginSuccessMessage, setLoginSuccessMessage] = useState(null);
  
  const [registerError, setRegisterError] = useState(null);
  const [registerFieldErrors, setRegisterFieldErrors] = useState({});
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState(null);
  
  // Field touched states (for validation on blur)
  const [touchedFields, setTouchedFields] = useState({
    login: {},
    register: {}
  });
  
  // Field focused state for showing requirement hints
  const [focusedField, setFocusedField] = useState(null);
  
  // Field requirement states
  const [loginFieldRequirements, setLoginFieldRequirements] = useState({});
  const [registerFieldRequirements, setRegisterFieldRequirements] = useState({});
  
  // Handle field focus for showing requirement hints
  const handleFieldFocus = (e, formType) => {
    const { name } = e.target;
    setFocusedField(`${formType}.${name}`);
    
    // Initialize field requirements if not already done
    if (formType === 'login' && !loginFieldRequirements[name]) {
      const fieldReqs = getFieldRequirements(name, loginData[name]);
      setLoginFieldRequirements(prev => ({
        ...prev,
        [name]: fieldReqs
      }));
    } else if (formType === 'register' && !registerFieldRequirements[name]) {
      const fieldReqs = getFieldRequirements(name, registerData[name], registerData);
      setRegisterFieldRequirements(prev => ({
        ...prev,
        [name]: fieldReqs
      }));
    }
  };
  
  // Handle login form input changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
    
    // Live validation
    const error = validateLoginField(name, value);
    setLoginFieldErrors({
      ...loginFieldErrors,
      [name]: touchedFields.login[name] ? error : null
    });
    
    // Update field requirements display
    const fieldReqs = getFieldRequirements(name, value);
    setLoginFieldRequirements(prev => ({
      ...prev,
      [name]: fieldReqs
    }));
  };
  
  // Handle register form input changes
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    const newRegisterData = {
      ...registerData,
      [name]: value
    };
    
    setRegisterData(newRegisterData);
    
    // Live validation
    const error = validateRegistrationField(name, value, newRegisterData);
    
    // Only show errors for fields that have been touched or modified
    if (touchedFields.register[name]) {
      setRegisterFieldErrors({
        ...registerFieldErrors,
        [name]: error
      });
    }
    
    // Update field requirements display
    const fieldReqs = getFieldRequirements(name, value, newRegisterData);
    setRegisterFieldRequirements(prev => ({
      ...prev,
      [name]: fieldReqs
    }));
    
    // Special case for password confirmation - update error when password changes
    if (name === 'password' && touchedFields.register.confirmPassword) {
      const confirmError = validateRegistrationField(
        'confirmPassword', 
        newRegisterData.confirmPassword, 
        newRegisterData
      );
      
      setRegisterFieldErrors({
        ...registerFieldErrors,
        confirmPassword: confirmError
      });
      
      // Update confirm password requirements
      const confirmReqs = getFieldRequirements(
        'confirmPassword', 
        newRegisterData.confirmPassword, 
        newRegisterData
      );
      setRegisterFieldRequirements(prev => ({
        ...prev,
        confirmPassword: confirmReqs
      }));
    }
  };
  
  // Handle field blur for showing validation errors
  const handleFieldBlur = (e, formType) => {
    const { name, value } = e.target;
    
    // Clear focused field after a short delay (to allow clicking on hints)
    setTimeout(() => {
      setFocusedField(null);
    }, 200);
    
    // Mark field as touched
    setTouchedFields({
      ...touchedFields,
      [formType]: {
        ...touchedFields[formType],
        [name]: true
      }
    });
    
    // Validate and show error if needed
    if (formType === 'login') {
      const error = validateLoginField(name, value);
      setLoginFieldErrors({
        ...loginFieldErrors,
        [name]: error
      });
    } else {
      const error = validateRegistrationField(name, value, registerData);
      setRegisterFieldErrors({
        ...registerFieldErrors,
        [name]: error
      });
    }
  };
  
  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccessMessage(null);
    setIsLoading(true);
    
    // Mark all login fields as touched for validation
    const allTouched = Object.keys(loginData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    
    setTouchedFields({
      ...touchedFields,
      login: allTouched
    });
    
    // Sanitize login data
    const sanitizedData = sanitizeLoginData(loginData);
    
    // Validate the sanitized data
    const validation = validateLoginData(sanitizedData);
    
    if (!validation.isValid) {
      setLoginFieldErrors(validation.errors);
      setIsLoading(false);
      
      // Error animation shake
      gsap.to(loginFormRef.current, {
        x: 10,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: "power2.inOut"
      });
      
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, sanitizedData);
      
      // Use the login function from context instead of direct localStorage
      login(response.data.user, response.data.token);
      
      setLoginSuccessMessage('Login successful! Redirecting...');
      
      // Success animation and redirect
      gsap.to(loginFormRef.current, {
        y: -10,
        opacity: 0.8,
        scale: 1.02,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
          navigate('/');
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with an error status
        if (error.response.data.errors) {
          setLoginFieldErrors(error.response.data.errors);
        } else {
          setLoginError(error.response.data.message || 'Login failed. Please try again.');
        }
      } else if (error.request) {
        // Request was made but no response
        setLoginError('No response from server. Please check your connection.');
      } else {
        // Something else happened
        setLoginError('An unexpected error occurred. Please try again.');
      }
      
      // Error animation shake
      gsap.to(loginFormRef.current, {
        x: 10,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: "power2.inOut"
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Handle register form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccessMessage(null);
    setIsLoading(true);
    
    // Mark all registration fields as touched for validation
    const allTouched = Object.keys(registerData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    
    setTouchedFields({
      ...touchedFields,
      register: allTouched
    });
    
    // Sanitize registration data
    const sanitizedData = sanitizeRegisterData(registerData);
    
    // Validate the sanitized data
    const validation = validateRegistrationData(sanitizedData);
    
    if (!validation.isValid) {
      setRegisterFieldErrors(validation.errors);
      setIsLoading(false);
      
      // Error animation shake
      gsap.to(registerFormRef.current, {
        x: 10,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: "power2.inOut"
      });
      
      return;
    }
    
    try {
      // Connect to the backend API
      await axios.post(`${API_BASE_URL}/auth/register`, sanitizedData);
      
      // Set success message
      setRegisterSuccessMessage('Registration successful! You can now log in.');
      
      // Success animation
      gsap.to(registerFormRef.current, {
        y: -10,
        opacity: 0.8,
        scale: 1.02,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
          // Switch to login after successful registration
          setTimeout(() => toggleFormMode(), 1500);
        }
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with an error status
        if (error.response.data.errors) {
          setRegisterFieldErrors(error.response.data.errors);
        } else {
          setRegisterError(error.response.data.message || 'Registration failed. Please try again.');
        }
      } else if (error.request) {
        // Request was made but no response
        setRegisterError('No response from server. Please check your connection.');
      } else {
        // Something else happened
        setRegisterError('An unexpected error occurred. Please try again.');
      }
      
      // Error animation shake
      gsap.to(registerFormRef.current, {
        x: 10,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: "power2.inOut"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { class: '', text: '' };
    
    if (password.length < 8) {
      return { class: 'weak', text: 'Too short' };
    }
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    const strengthScore = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (strengthScore <= 2) return { class: 'weak', text: 'Weak' };
    if (strengthScore === 3) return { class: 'medium', text: 'Medium' };
    return { class: 'strong', text: 'Strong' };
  };
  
  const passwordStrength = getPasswordStrength(registerData.password);
  
  // Toggle between login and register forms with animation
  const toggleFormMode = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Reset error states when switching forms
    setLoginError(null);
    setLoginFieldErrors({});
    setLoginSuccessMessage(null);
    setRegisterError(null);
    setRegisterFieldErrors({});
    setRegisterSuccessMessage(null);
    
    // Reset touched states
    setTouchedFields({
      login: {},
      register: {}
    });
    
    // Reset field requirements
    setLoginFieldRequirements({});
    setRegisterFieldRequirements({});
    
    // Reset focused field
    setFocusedField(null);
    
    const tl = gsap.timeline({
      onComplete: () => {
        setIsLogin(!isLogin);
        setIsAnimating(false);
      }
    });
    
    // Current form exit animation
    tl.to(isLogin ? loginFormRef.current : registerFormRef.current, {
      opacity: 0,
      y: 50,
      scale: 0.9,
      duration: 0.5,
      ease: "power2.out"
    });
    
    // Container background shift animation
    tl.to(formContainerRef.current, {
      backgroundColor: isLogin ? 
        'rgba(10, 31, 15, 0.9)' : 'rgba(42, 94, 54, 0.9)',
      duration: 0.5,
      ease: "power2.inOut"
    }, "-=0.3");
    
    // New form enter animation (will execute after state change in useEffect)
  };
  
  // Initialize page animations
  useEffect(() => {
    gsap.fromTo(
      pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );
    
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" }
    );
    
    gsap.fromTo(
      formContainerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: "power2.out" }
    );
    
    // Initial form animation
    gsap.fromTo(
      loginFormRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.6, ease: "power2.out" }
    );
    
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // User is already logged in, you might want to redirect or show a different view
      console.log('User is already logged in:', JSON.parse(storedUser));
      // This would be handled by a router or context in a real application
    }
  }, []);
  
  // Animation for form switching
  useEffect(() => {
    if (isLogin) {
      // Show login form with animation
      gsap.fromTo(
        loginFormRef.current,
        { opacity: 0, y: -50, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5, 
          ease: "power2.out" 
        }
      );
    } else {
      // Show register form with animation
      gsap.fromTo(
        registerFormRef.current,
        { opacity: 0, y: -50, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5, 
          ease: "power2.out" 
        }
      );
    }
  }, [isLogin]);
  
  return (
    <section className="auth-page" ref={pageRef}>
      <div className="auth-page__content">
        <h1 className="auth-title" ref={titleRef}>
          {isLogin ? "WELCOME BACK" : "JOIN US"}
        </h1>
        <p className="auth-description">
          {isLogin 
            ? "Sign in to access your account" 
            : "Create an account to get started"
          }
        </p>
        
        <div className="auth-form-container" ref={formContainerRef}>
          <div className="form-wrapper">
            {/* Login Form */}
            <form 
              className={`auth-form login-form ${isLogin ? 'visible' : 'hidden'}`}
              onSubmit={handleLoginSubmit}
              ref={loginFormRef}
            >
              <div className={`form-group ${loginFieldErrors.email ? 'error' : ''}`}>
                <label htmlFor="login-email">Email</label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  onFocus={(e) => handleFieldFocus(e, 'login')}
                  onBlur={(e) => handleFieldBlur(e, 'login')}
                  required
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                <FieldRequirementHints
                  requirements={loginFieldRequirements.email?.requirements || []}
                  status={loginFieldRequirements.email?.status || []}
                  visible={focusedField === 'login.email' || (loginData.email && loginData.email.length > 0)}
                />
                {loginFieldErrors.email && (
                  <div className="validation-message error">
                    {loginFieldErrors.email}
                  </div>
                )}
              </div>
              
              <div className={`form-group ${loginFieldErrors.password ? 'error' : ''}`}>
                <label htmlFor="login-password">Password</label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  onFocus={(e) => handleFieldFocus(e, 'login')}
                  onBlur={(e) => handleFieldBlur(e, 'login')}
                  required
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <FieldRequirementHints
                  requirements={loginFieldRequirements.password?.requirements || []}
                  status={loginFieldRequirements.password?.status || []}
                  visible={focusedField === 'login.password'}
                />
                {loginFieldErrors.password && (
                  <div className="validation-message error">
                    {loginFieldErrors.password}
                  </div>
                )}
              </div>
              
              <div className={`form-group ${loginFieldErrors.cpNumber ? 'error' : ''}`}>
                <label htmlFor="login-cpNumber">CP Number</label>
                <input
                  type="text"
                  id="login-cpNumber"
                  name="cpNumber"
                  value={loginData.cpNumber}
                  onChange={handleLoginChange}
                  onFocus={(e) => handleFieldFocus(e, 'login')}
                  onBlur={(e) => handleFieldBlur(e, 'login')}
                  required
                  placeholder="Enter your CP Number"
                  disabled={isLoading}
                />
                <FieldRequirementHints
                  requirements={loginFieldRequirements.cpNumber?.requirements || []}
                  status={loginFieldRequirements.cpNumber?.status || []}
                  visible={focusedField === 'login.cpNumber'}
                />
                {loginFieldErrors.cpNumber && (
                  <div className="validation-message error">
                    {loginFieldErrors.cpNumber}
                  </div>
                )}
              </div>
              
              {loginError && (
                <div className="error-message">{loginError}</div>
              )}
              
              {loginSuccessMessage && (
                <div className="success-message">{loginSuccessMessage}</div>
              )}
            
              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            
              <p className="auth-form-toggle">
                Don't have an account?{" "}
                <button 
                  type="button" 
                  className="toggle-button"
                  onClick={toggleFormMode}
                  disabled={isLoading}
                >
                  Register
                </button>
              </p>
            </form>
            
            {/* Register Form */}
            <form 
              className={`auth-form register-form ${!isLogin ? 'visible' : 'hidden'}`}
              onSubmit={handleRegisterSubmit}
              ref={registerFormRef}
            >
              <div className={`form-group ${registerFieldErrors.id_number ? 'error' : ''}`}>
                <label htmlFor="register-id_number">ID Number</label>
                <input
                  type="text"
                  id="register-id_number"
                  name="id_number"
                  value={registerData.id_number}
                  onChange={handleRegisterChange}
                  onFocus={(e) => handleFieldFocus(e, 'register')}
                  onBlur={(e) => handleFieldBlur(e, 'register')}
                  required
                  placeholder="Enter your ID number"
                  pattern="[0-9]{13}"
                  title="ID Number must be 13 digits"
                  disabled={isLoading}
                />
                <FieldRequirementHints
                  requirements={registerFieldRequirements.id_number?.requirements || []}
                  status={registerFieldRequirements.id_number?.status || []}
                  visible={focusedField === 'register.id_number' || (registerData.id_number && registerData.id_number.length > 0)}
                />
                {registerFieldErrors.id_number && (
                  <div className="validation-message error">
                    {registerFieldErrors.id_number}
                  </div>
                )}
              </div>
              
              {/* <div className={`form-group ${registerFieldErrors.cpNumber ? 'error' : ''}`}>
                <label htmlFor="register-cpNumber">CP Number</label>
                <input
                  type="text"
                  id="register-cpNumber"
                  name="cpNumber"
                  value={registerData.cpNumber}
                  onChange={handleRegisterChange}
                  onFocus={(e) => handleFieldFocus(e, 'register')}
                  onBlur={(e) => handleFieldBlur(e, 'register')}
                  required
                  placeholder="Enter your CP Number"
                  disabled={isLoading}
                />
                <FieldRequirementHints
                  requirements={registerFieldRequirements.cpNumber?.requirements || []}
                  status={registerFieldRequirements.cpNumber?.status || []}
                  visible={focusedField === 'register.cpNumber'}
                />
                {registerFieldErrors.cpNumber && (
                  <div className="validation-message error">
                    {registerFieldErrors.cpNumber}
                  </div>
                )}
              </div> */}
              
              <div className="form-row">
                <div className={`form-group ${registerFieldErrors.first_name ? 'error' : ''}`}>
                  <label htmlFor="register-first_name">First Name</label>
                  <input
                    type="text"
                    id="register-first_name"
                    name="first_name"
                    value={registerData.first_name}
                    onChange={handleRegisterChange}
                    onFocus={(e) => handleFieldFocus(e, 'register')}
                    onBlur={(e) => handleFieldBlur(e, 'register')}
                    required
                    placeholder="Enter your first name"
                    disabled={isLoading}
                  />
                  {registerFieldErrors.first_name && (
                    <div className="validation-message error">
                      {registerFieldErrors.first_name}
                    </div>
                  )}
                </div>
                
                <div className={`form-group ${registerFieldErrors.last_name ? 'error' : ''}`}>
                  <label htmlFor="register-last_name">Last Name</label>
                  <input
                    type="text"
                    id="register-last_name"
                    name="last_name"
                    value={registerData.last_name}
                    onChange={handleRegisterChange}
                    onFocus={(e) => handleFieldFocus(e, 'register')}
                    onBlur={(e) => handleFieldBlur(e, 'register')}
                    required
                    placeholder="Enter your last name"
                    disabled={isLoading}
                  />
                  {registerFieldErrors.last_name && (
                    <div className="validation-message error">
                      {registerFieldErrors.last_name}
                    </div>
                  )}
                </div>
                
                {/* <div className={`form-group ${registerFieldErrors.surname ? 'error' : ''}`}>
                  <label htmlFor="register-surname">Surname</label>
                  <input
                    type="text"
                    id="register-surname"
                    name="surname"
                    value={registerData.surname}
                    onChange={handleRegisterChange}
                    onFocus={(e) => handleFieldFocus(e, 'register')}
                    onBlur={(e) => handleFieldBlur(e, 'register')}
                    required
                    placeholder="Enter your surname"
                    disabled={isLoading}
                  />
                  {registerFieldErrors.surname && (
                    <div className="validation-message error">
                      {registerFieldErrors.surname}
                    </div>
                  )}
                </div> */}
              </div>
              
              <div className={`form-group ${registerFieldErrors.email ? 'error' : ''}`}>
                <label htmlFor="register-email">Email</label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  onFocus={(e) => handleFieldFocus(e, 'register')}
                  onBlur={(e) => handleFieldBlur(e, 'register')}
                  required
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                <FieldRequirementHints
                  requirements={registerFieldRequirements.email?.requirements || []}
                  status={registerFieldRequirements.email?.status || []}
                  visible={focusedField === 'register.email'}
                />
                {registerFieldErrors.email && (
                  <div className="validation-message error">
                    {registerFieldErrors.email}
                  </div>
                )}
              </div>
              
              <div className={`form-group ${registerFieldErrors.phone_number ? 'error' : ''}`}>
                <label htmlFor="register-phone_number">Phone Number</label>
                <input
                  type="tel"
                  id="register-phone_number"
                  name="phone_number"
                  value={registerData.phone_number}
                  onChange={handleRegisterChange}
                  onFocus={(e) => handleFieldFocus(e, 'register')}
                  onBlur={(e) => handleFieldBlur(e, 'register')}
                  required
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                />
                <FieldRequirementHints
                  requirements={registerFieldRequirements.phone_number?.requirements || []}
                  status={registerFieldRequirements.phone_number?.status || []}
                  visible={focusedField === 'register.phone_number'}
                />
                {registerFieldErrors.phone_number && (
                  <div className="validation-message error">
                    {registerFieldErrors.phone_number}
                  </div>
                )}
              </div>
              
              <div className={`form-group ${registerFieldErrors.address ? 'error' : ''}`}>
                <label htmlFor="register-address">Address</label>
                <textarea
                  id="register-address"
                  name="address"
                  value={registerData.address}
                  onChange={handleRegisterChange}
                  onFocus={(e) => handleFieldFocus(e, 'register')}
                  onBlur={(e) => handleFieldBlur(e, 'register')}
                  required
                  placeholder="Enter your address"
                  rows="3"
                  disabled={isLoading}
                ></textarea>
                <FieldRequirementHints
                  requirements={registerFieldRequirements.address?.requirements || []}
                  status={registerFieldRequirements.address?.status || []}
                  visible={focusedField === 'register.address'}
                />
                {registerFieldErrors.address && (
                  <div className="validation-message error">
                    {registerFieldErrors.address}
                  </div>
                )}
              </div>
              
              <div className={`form-group ${registerFieldErrors.password ? 'error' : ''}`}>
                <label htmlFor="register-password">Password</label>
                <input
                  type="password"
                  id="register-password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  onFocus={(e) => handleFieldFocus(e, 'register')}
                  onBlur={(e) => handleFieldBlur(e, 'register')}
                  required
                  placeholder="Create a password"
                  disabled={isLoading}
                />
                {registerData.password && (
                  <div className={`password-strength ${passwordStrength.class}`}>
                    <span className="strength-label">Strength:</span> {passwordStrength.text}
                    <div className="strength-meter">
                      <div className={`strength-meter-fill ${passwordStrength.class}`}></div>
                    </div>
                  </div>
                )}
                <FieldRequirementHints
                  requirements={registerFieldRequirements.password?.requirements || []}
                  status={registerFieldRequirements.password?.status || []}
                  visible={focusedField === 'register.password'}
                />
                {registerFieldErrors.password && (
                  <div className="validation-message error">
                    {registerFieldErrors.password}
                  </div>
                )}
              </div>
              
              <div className={`form-group ${registerFieldErrors.confirmPassword ? 'error' : ''}`}>
                <label htmlFor="register-confirm-password">Confirm Password</label>
                <input
                  type="password"
                  id="register-confirm-password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  onFocus={(e) => handleFieldFocus(e, 'register')}
                  onBlur={(e) => handleFieldBlur(e, 'register')}
                  required
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <FieldRequirementHints
                  requirements={registerFieldRequirements.confirmPassword?.requirements || []}
                  status={registerFieldRequirements.confirmPassword?.status || []}
                  visible={focusedField === 'register.confirmPassword'}
                />
                {registerFieldErrors.confirmPassword && (
                  <div className="validation-message error">
                    {registerFieldErrors.confirmPassword}
                  </div>
                )}
              </div>
            
              {registerError && (
                <div className="error-message">{registerError}</div>
              )}
              
              {registerSuccessMessage && (
                <div className="success-message">{registerSuccessMessage}</div>
              )}
            
              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? "Registering..." : "Create Account"}
              </button>
            
              <p className="auth-form-toggle">
                Already have an account?{" "}
                <button 
                  type="button" 
                  className="toggle-button"
                  onClick={toggleFormMode}
                  disabled={isLoading}
                >
                  Sign In
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}