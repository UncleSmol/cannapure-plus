import { useState, useEffect } from 'react';
import StrainDataService from '../../../services/StrainDataService';
import { processApiResponse, processRawData } from '../utils/strainDataUtils';

/**
 * Custom hook for managing strain data fetching and processing
 * @param {boolean} debugMode - Whether to enable debug logging
 * @returns {Object} - Strain data state and operations
 */
const useStrainData = (debugMode = true) => {
  const [strainData, setStrainData] = useState({});
  const [categoryCounts, setCategoryCounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadStrains = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Get the strain data using the service
      const data = await StrainDataService.fetchAllStrains();
      
      if (debugMode) {
        console.log('Raw data received in budbar:', data);
      }
      
      // Check if we received nested data structure
      const processedData = data.data && Array.isArray(data.data) 
        ? processApiResponse(data) 
        : processRawData(data);
      
      // Set the strain data
      setStrainData(processedData || {});
      
      // Count items in each category for debugging
      const counts = {};
      Object.entries(processedData || {}).forEach(([category, items]) => {
        counts[category] = Array.isArray(items) ? items.length : 0;
      });
      setCategoryCounts(counts);
      
      if (debugMode) {
        console.log('Counts by category:', counts);
      }
    } catch (error) {
      console.error('Error loading strains:', error);
      setStrainData({}); // Set empty object on error
      setErrorMessage('Failed to load strain data. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStrainData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Force fetch fresh data with cache bypassing
      const data = await StrainDataService.refreshStrains();
      
      if (debugMode) {
        console.log('Refreshed data received in budbar:', data);
      }
      
      // Process and update the state
      const processedData = data.data && Array.isArray(data.data) 
        ? processApiResponse(data) 
        : processRawData(data);
      
      // Set the strain data
      setStrainData(processedData || {});
      
      // Count items in each category for debugging
      const counts = {};
      Object.entries(processedData || {}).forEach(([category, items]) => {
        counts[category] = Array.isArray(items) ? items.length : 0;
      });
      setCategoryCounts(counts);
      
      if (debugMode) {
        console.log('Updated counts by category:', counts);
      }
    } catch (error) {
      console.error('Error refreshing strains:', error);
      setErrorMessage('Failed to refresh strain data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load strains on mount
  useEffect(() => {
    loadStrains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    strainData,
    categoryCounts,
    isLoading,
    errorMessage,
    refreshStrainData,
    logStrainData: () => console.log(strainData)
  };
};

export default useStrainData;