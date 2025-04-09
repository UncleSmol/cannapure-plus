/**
 * Form Data Sanitization Utilities
 * 
 * This module provides functions to sanitize and validate form data
 * for the authentication forms (login and registration).
 */

/**
 * Field requirements for each form field
 * Used to provide live hints to users while filling out forms
 */
export const fieldRequirements = {
  // Login form requirements
  email: {
    label: 'Email',
    requirements: ['Valid email format (e.g., user@example.com)'],
  },
  password: {
    label: 'Password',
    requirements: [
      'At least 8 characters',
      'Include uppercase and lowercase letters',
      'Include at least one number',
      'Include at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)'
    ],
  },
  cpNumber: {
    label: 'CP Number',
    requirements: ['Required for account identification']
  },

  // Registration form requirements
  id_number: {
    label: 'ID Number',
    requirements: [
      'Must be 13 digits',
      'Only numeric characters allowed'
    ]
  },
  first_name: {
    label: 'First Name',
    requirements: ['At least 2 characters']
  },
  last_name: {
    label: 'Last Name',
    requirements: ['At least 2 characters']
  },
  surname: {
    label: 'Surname',
    requirements: ['At least 2 characters']
  },
  phone_number: {
    label: 'Phone Number',
    requirements: [
      'At least 10 digits',
      'Only numeric characters allowed'
    ]
  },
  address: {
    label: 'Address',
    requirements: ['At least 10 characters']
  },
  confirmPassword: {
    label: 'Confirm Password',
    requirements: ['Must match the password field']
  }
};

/**
 * Returns the requirements for a specific form field
 * @param {string} fieldName - The name of the field
 * @param {string} value - Value of the field
 * @param {object} allValues - All form values (for validations that depend on other fields)
 * @returns {object} - The field requirements and current validation status
 */
export const getFieldRequirements = (fieldName, value = '', allValues = {}) => {
  if (!fieldRequirements[fieldName]) {
    return { requirements: [], status: [] };
  }

  const requirements = fieldRequirements[fieldName].requirements;
  const status = [];

  // Validate each requirement and return its status
  switch (fieldName) {
    case 'email':
      status.push(isValidEmail(value) ? 'valid' : 'invalid');
      break;
      
    case 'password':
      const hasMinLength = value.length >= 8;
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);
      
      status.push(hasMinLength ? 'valid' : 'invalid');
      status.push((hasUppercase && hasLowercase) ? 'valid' : 'invalid');
      status.push(hasNumber ? 'valid' : 'invalid');
      status.push(hasSpecial ? 'valid' : 'invalid');
      break;
      
    case 'cpNumber':
      status.push(value.trim() !== '' ? 'valid' : 'invalid');
      break;
      
    case 'id_number':
      const isNumeric = /^\d+$/.test(value);
      const isCorrectLength = value.length === 13;
      
      status.push(isNumeric ? 'valid' : 'invalid');
      status.push(isCorrectLength ? 'valid' : 'invalid');
      break;
      
    case 'first_name':
    case 'last_name':
    case 'surname':
      status.push(value.length >= 2 ? 'valid' : 'invalid');
      break;
      
    case 'phone_number':
      const isNumericPhone = /^\d+$/.test(value.replace(/\D/g, ''));
      const isLongEnough = value.replace(/\D/g, '').length >= 10;
      
      status.push(isNumericPhone ? 'valid' : 'invalid');
      status.push(isLongEnough ? 'valid' : 'invalid');
      break;
      
    case 'address':
      status.push(value.length >= 10 ? 'valid' : 'invalid');
      break;
      
    case 'confirmPassword':
      status.push(value === allValues.password ? 'valid' : 'invalid');
      break;
      
    default:
      // For any other field, just check if it's not empty
      status.push(value.trim() !== '' ? 'valid' : 'invalid');
  }
  
  return {
    requirements,
    status
  };
};

/**
 * Sanitizes text inputs by trimming whitespace and removing special characters
 * @param {string} input - The text input to sanitize
 * @param {boolean} allowSpaces - Whether to allow spaces in the input
 * @returns {string} - The sanitized input
 */
export const sanitizeText = (input, allowSpaces = true) => {
  if (!input) return '';
  
  // Trim whitespace from both ends
  let sanitized = input.trim();
  
  // Replace multiple spaces with a single space
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  if (!allowSpaces) {
    // Remove all spaces if spaces are not allowed
    sanitized = sanitized.replace(/\s/g, '');
  }
  
  // Remove any potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  return sanitized;
};

/**
 * Sanitizes an email address
 * @param {string} email - The email to sanitize
 * @returns {string} - The sanitized email
 */
export const sanitizeEmail = (email) => {
  if (!email) return '';
  
  // Trim whitespace and convert to lowercase
  let sanitized = email.trim().toLowerCase();
  
  // Remove any spaces
  sanitized = sanitized.replace(/\s/g, '');
  
  // Basic email format validation (simple check for demonstration)
  if (!isValidEmail(sanitized)) {
    return sanitized;
  }
  
  return sanitized;
};

/**
 * Checks if an email address is valid
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitizes a phone number by removing non-digit characters
 * @param {string} phoneNumber - The phone number to sanitize
 * @returns {string} - The sanitized phone number
 */
export const sanitizePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  return phoneNumber.replace(/\D/g, '');
};

/**
 * Validates a South African ID number
 * @param {string} idNumber - The ID number to validate
 * @returns {boolean} - Whether the ID number is valid
 */
export const isValidIdNumber = (idNumber) => {
  // Remove any non-digit characters
  const cleanId = idNumber.replace(/\D/g, '');
  
  // South African ID numbers are 13 digits
  if (cleanId.length !== 13) {
    return false;
  }
  
  // Check that all characters are digits
  if (!/^\d+$/.test(cleanId)) {
    return false;
  }
  
  // Further validation could be added for actual ID number algorithm
  // This is a simplified check
  
  return true;
};

/**
 * Sanitizes an ID number by removing non-digit characters
 * @param {string} idNumber - The ID number to sanitize
 * @returns {string} - The sanitized ID number
 */
export const sanitizeIdNumber = (idNumber) => {
  if (!idNumber) return '';
  
  // Remove all non-digit characters
  const sanitized = idNumber.replace(/\D/g, '');
  
  return sanitized;
};

/**
 * Sanitizes a CP Number
 * @param {string} cpNumber - The CP number to sanitize
 * @returns {string} - The sanitized CP number
 */
export const sanitizeCPNumber = (cpNumber) => {
  if (!cpNumber) return '';
  
  // Remove any special characters that aren't alphanumeric
  let sanitized = cpNumber.replace(/[^\w]/g, '');
  
  // Force uppercase for CP number convention
  sanitized = sanitized.toUpperCase();
  
  return sanitized;
};

/**
 * Sanitizes an address
 * @param {string} address - The address to sanitize
 * @returns {string} - The sanitized address
 */
export const sanitizeAddress = (address) => {
  if (!address) return '';
  
  // Trim whitespace
  let sanitized = address.trim();
  
  // Replace multiple spaces with a single space
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  return sanitized;
};

/**
 * Sanitizes a password (minimally, as passwords should remain as entered)
 * @param {string} password - The password to sanitize
 * @returns {string} - The sanitized password
 */
export const sanitizePassword = (password) => {
  if (!password) return '';
  
  // Just trim whitespace from ends
  return password.trim();
};

/**
 * Checks if a password meets security requirements
 * @param {string} password - The password to validate
 * @returns {object} - Validation result with status and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { 
      valid: false, 
      message: 'Password is required' 
    };
  }
  
  if (password.length < 8) {
    return { 
      valid: false, 
      message: 'Password must be at least 8 characters long' 
    };
  }
  
  // Check for mix of character types
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  // Fixed regex to avoid unnecessary escape characters
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  
  if (!(hasUppercase && hasLowercase && hasNumber)) {
    return { 
      valid: false, 
      message: 'Password must include uppercase, lowercase, and numbers' 
    };
  }
  
  if (!hasSpecial) {
    return { 
      valid: false, 
      message: 'Password must include at least one special character' 
    };
  }
  
  return { 
    valid: true, 
    message: 'Password is strong' 
  };
};

/**
 * Validates login data
 * @param {object} data - The login data to validate
 * @returns {object} - Validation result with status and errors
 */
export const validateLoginData = (data) => {
  const errors = {};
  
  // Email validation
  if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password basic validation
  if (!data.password || data.password.length < 8) {
    errors.password = 'Please enter your password';
  }
  
  // CP Number validation
  if (!data.cpNumber || data.cpNumber.trim() === '') {
    errors.cpNumber = 'CP Number is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitizes the login form data
 * @param {object} loginData - The login form data
 * @returns {object} - The sanitized login form data
 */
export const sanitizeLoginData = (loginData) => {
  return {
    email: sanitizeEmail(loginData.email),
    password: sanitizePassword(loginData.password),
    cpNumber: sanitizeCPNumber(loginData.cpNumber)
  };
};

/**
 * Sanitizes the registration form data
 * @param {object} registerData - The registration form data
 * @returns {object} - The sanitized registration form data
 */
export const sanitizeRegisterData = (registerData) => {
  return {
    id_number: sanitizeIdNumber(registerData.id_number),
    first_name: sanitizeText(registerData.first_name),
    last_name: sanitizeText(registerData.last_name),
    surname: sanitizeText(registerData.surname),
    email: sanitizeEmail(registerData.email),
    phone_number: sanitizePhoneNumber(registerData.phone_number),
    address: sanitizeAddress(registerData.address),
    password: sanitizePassword(registerData.password),
    confirmPassword: sanitizePassword(registerData.confirmPassword)
  };
};

/**
 * Comprehensively validates registration data
 * @param {object} data - The registration data to validate
 * @returns {object} - Validation result with status and errors
 */
export const validateRegistrationData = (data) => {
  const errors = {};
  
  // ID number validation
  if (!isValidIdNumber(data.id_number)) {
    errors.id_number = 'Please enter a valid 13-digit ID number';
  }
  
  // Name validations
  if (!data.first_name || data.first_name.length < 2) {
    errors.first_name = 'First name must be at least 2 characters';
  }
  
  if (!data.last_name || data.last_name.length < 2) {
    errors.last_name = 'Last name must be at least 2 characters';
  }
  
  // Email validation
  if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Phone validation (simple length check for demo)
  if (!data.phone_number || data.phone_number.length < 10) {
    errors.phone_number = 'Please enter a valid phone number';
  }
  
  // Address validation
  if (!data.address || data.address.length < 10) {
    errors.address = 'Please enter a complete address';
  }
  
  // Password validation
  const passwordCheck = validatePassword(data.password);
  if (!passwordCheck.valid) {
    errors.password = passwordCheck.message;
  }
  
  // Confirm password validation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates a single field in the registration form
 * @param {string} fieldName - Name of the field to validate
 * @param {string} value - Value of the field
 * @param {object} allValues - All form values (for validations that depend on other fields)
 * @returns {string|null} - Error message or null if valid
 */
export const validateRegistrationField = (fieldName, value, allValues = {}) => {
  switch (fieldName) {
    case 'id_number':
      if (!value) return 'ID Number is required';
      if (!isValidIdNumber(value)) return 'Please enter a valid 13-digit ID number';
      break;
      
    case 'first_name':
      if (!value) return 'First name is required';
      if (value.length < 2) return 'First name must be at least 2 characters';
      break;
      
    case 'last_name':
      if (!value) return 'Last name is required';
      if (value.length < 2) return 'Last name must be at least 2 characters';
      break;
      
    case 'email':
      if (!value) return 'Email is required';
      if (!isValidEmail(value)) return 'Please enter a valid email address';
      break;
      
    case 'phone_number':
      if (!value) return 'Phone number is required';
      if (sanitizePhoneNumber(value).length < 10) return 'Please enter a valid phone number';
      break;
      
    case 'address':
      if (!value) return 'Address is required';
      if (value.length < 10) return 'Please enter a complete address';
      break;
      
    case 'password':
      const passwordCheck = validatePassword(value);
      if (!passwordCheck.valid) return passwordCheck.message;
      break;
      
    case 'confirmPassword':
      if (!value) return 'Please confirm your password';
      if (allValues.password && value !== allValues.password) return 'Passwords do not match';
      break;
      
    default:
      return null;
  }
  
  return null;
};

/**
 * Validates a single field in the login form
 * @param {string} fieldName - Name of the field to validate
 * @param {string} value - Value of the field
 * @returns {string|null} - Error message or null if valid
 */
export const validateLoginField = (fieldName, value) => {
  switch (fieldName) {
    case 'email':
      if (!value) return 'Email is required';
      if (!isValidEmail(value)) return 'Please enter a valid email address';
      break;
      
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      break;
      
    case 'cpNumber':
      if (!value) return 'CP Number is required';
      break;
      
    default:
      return null;
  }
  
  return null;
};

// Create a named variable for the default export to fix ESLint warning
const authUtils = {
  sanitizeText,
  sanitizeEmail,
  sanitizePhoneNumber,
  sanitizeIdNumber,
  sanitizeCPNumber,
  sanitizeAddress,
  sanitizePassword,
  isValidEmail,
  isValidIdNumber,
  validatePassword,
  validateLoginData,
  validateLoginField,
  sanitizeLoginData,
  sanitizeRegisterData,
  validateRegistrationData,
  validateRegistrationField,
  getFieldRequirements,
  fieldRequirements
};

export default authUtils;
