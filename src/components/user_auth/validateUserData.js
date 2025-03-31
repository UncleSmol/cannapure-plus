import validator from 'validator';

// South Africa specific validation functions
const isSAIDNumber = (id) => /^[0-9]{13}$/.test(id); // Basic SA ID validation
const isSAPhoneNumber = (phone) => 
  validator.isMobilePhone(phone, 'en-ZA') || 
  validator.isMobilePhone(phone, 'any', { strictMode: false });

export function validateUserData(userData) {
  let errors = {};

  // First Name Validation
  if (!userData.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ]+$/.test(userData.firstName)) {
    errors.firstName = 'Only letters and accents allowed';
  }

  // Email Validation
  if (!userData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validator.isEmail(userData.email)) {
    errors.email = 'Invalid email format';
  }

  // SA Phone Validation
  if (!userData.phoneNumber.trim()) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!isSAPhoneNumber(userData.phoneNumber)) {
    errors.phoneNumber = 'Valid SA number required (e.g. 081 234 5678)';
  }

  // SA ID Validation
  if (!userData.idNumber.trim()) {
    errors.idNumber = 'ID number is required';
  } else if (!isSAIDNumber(userData.idNumber)) {
    errors.idNumber = 'Invalid SA ID format (13 digits)';
  }

  // Address Validation
  if (!userData.address.trim()) {
    errors.address = 'Address is required';
  } else if (userData.address.length < 10) {
    errors.address = 'Address too short (min 10 characters)';
  }

  // Password Validation
  if (!userData.password.trim()) {
    errors.password = 'Password required';
  } else if (userData.password.length < 8) {
    errors.password = 'Password too short (min 8 characters)';
  }

  return { errors };
}