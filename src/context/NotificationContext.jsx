import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Create the notification context
export const NotificationContext = createContext();

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Add a new notification
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
    const id = Date.now().toString();
    
    setNotifications(prev => [
      ...prev,
      { id, message, type, duration }
    ]);
    
    return id;
  }, []);
  
  // Remove a notification by its id
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  // Convenience methods for different notification types
  const success = useCallback((message, duration) => 
    addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration), [addNotification]);
  
  const error = useCallback((message, duration) => 
    addNotification(message, NOTIFICATION_TYPES.ERROR, duration), [addNotification]);
  
  const warning = useCallback((message, duration) => 
    addNotification(message, NOTIFICATION_TYPES.WARNING, duration), [addNotification]);
  
  const info = useCallback((message, duration) => 
    addNotification(message, NOTIFICATION_TYPES.INFO, duration), [addNotification]);
  
  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};