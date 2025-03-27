import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Create context
export const NotificationContext = createContext();

// Initial state
const initialState = {
  notifications: [],
  maxNotifications: 5,
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Action types
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
const CLEAR_NOTIFICATIONS = 'CLEAR_NOTIFICATIONS';

// Unique ID generator for notifications
const generateUniqueId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Reducer function
const notificationReducer = (state, action) => {
  switch (action.type) {
    case ADD_NOTIFICATION:
      // Remove oldest notification if we've reached the maximum
      const notifications = state.notifications.length >= state.maxNotifications
        ? state.notifications.slice(1)
        : state.notifications;
      
      return {
        ...state,
        notifications: [...notifications, action.payload],
      };
    
    case REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
      };
    
    case CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };
      
    default:
      return state;
  }
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Add notification
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
    const id = generateUniqueId();
    
    dispatch({
      type: ADD_NOTIFICATION,
      payload: {
        id,
        message,
        type,
        duration,
      },
    });

    // Auto-remove notification after duration
    if (duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  // Remove notification by ID
  const removeNotification = useCallback((id) => {
    dispatch({
      type: REMOVE_NOTIFICATION,
      payload: id,
    });
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    dispatch({ type: CLEAR_NOTIFICATIONS });
  }, []);

  // Convenience methods for different notification types
  const success = useCallback((message, duration = 5000) => {
    return addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
  }, [addNotification]);

  const error = useCallback((message, duration = 5000) => {
    return addNotification(message, NOTIFICATION_TYPES.ERROR, duration);
  }, [addNotification]);

  const warning = useCallback((message, duration = 5000) => {
    return addNotification(message, NOTIFICATION_TYPES.WARNING, duration);
  }, [addNotification]);

  const info = useCallback((message, duration = 5000) => {
    return addNotification(message, NOTIFICATION_TYPES.INFO, duration);
  }, [addNotification]);

  // Context value
  const value = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearNotifications,
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

// Custom hook for using the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};