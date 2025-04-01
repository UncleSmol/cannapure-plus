/**
 * Formats a date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format:', dateString);
      return 'N/A';
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Calculates the number of active days based on issue date
 * @param {string} issuedDate - ISO date string of when membership was issued
 * @returns {number} Number of active days
 */
export const calculateActiveDays = (issuedDate) => {
  if (!issuedDate) return 0;
  
  try {
    const issueDate = new Date(issuedDate);
    const currentDate = new Date();
    
    // Check if the date is valid
    if (isNaN(issueDate.getTime())) {
      console.warn('Invalid issue date format:', issuedDate);
      return 0;
    }
    
    // Calculate difference in milliseconds
    const diffTime = Math.abs(currentDate - issueDate);
    // Convert to days
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Error calculating active days:', error);
    return 0;
  }
};

/**
 * Formats active days with proper suffix
 * @param {number|string} days - Number of active days
 * @returns {string} Formatted active days string
 */
export const formatActiveDays = (days) => {
  if (days === undefined || days === null) return "N/A";
  
  const dayNum = parseInt(days, 10);
  if (isNaN(dayNum)) return "N/A";
  
  return `${dayNum} day${dayNum !== 1 ? 's' : ''}`;
};