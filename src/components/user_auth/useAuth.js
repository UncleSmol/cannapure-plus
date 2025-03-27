import { useAuth as useMainAuth } from '../../context/AuthProvider';

/**
 * This file is kept for backward compatibility.
 * It re-exports the useAuth hook from the main context provider.
 * 
 * @returns {Object} Authentication context
 */
const useAuth = () => {
  return useMainAuth();
};

export default useAuth;
