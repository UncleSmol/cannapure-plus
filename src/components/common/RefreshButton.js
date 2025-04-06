import React, { useState } from 'react';
import { clearStrainDataCache } from '../../components/strain_card/StrainDataService';

/**
 * RefreshButton - A component that provides a button to refresh data
 * by clearing cache and forcing a reload
 * 
 * @param {Object} props Component props
 * @param {Function} props.onRefresh Callback function after refresh
 * @param {string} props.className Additional CSS classes
 * @param {Object} props.style Additional inline styles
 * @returns {JSX.Element} Rendered component
 */
const RefreshButton = ({ onRefresh, className = '', style = {} }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Clear the strain data cache
      clearStrainDataCache();
      
      // Execute the onRefresh callback if provided
      if (typeof onRefresh === 'function') {
        await onRefresh();
      } else {
        // Default behavior: reload the page
        window.location.reload();
      }
    } catch (error) {
      console.error('Error during refresh:', error);
      alert('Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`refresh-button ${isRefreshing ? 'refreshing' : ''} ${className}`}
      style={style}
      aria-label="Refresh data"
      title="Refresh data"
    >
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
      <span className="refresh-icon">
        {isRefreshing ? '⟳' : '↻'}
      </span>
      
      <style jsx>{`
        .refresh-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          background: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s, transform 0.1s;
        }
        
        .refresh-button:hover {
          background: #3a80d2;
        }
        
        .refresh-button:active {
          transform: scale(0.98);
        }
        
        .refresh-button.refreshing {
          background: #7a7a7a;
          cursor: not-allowed;
        }
        
        .refresh-icon {
          margin-left: 8px;
          font-size: 16px;
        }
        
        .refreshing .refresh-icon {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default RefreshButton;