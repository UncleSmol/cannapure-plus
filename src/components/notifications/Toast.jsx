import React, { useEffect, useRef } from 'react';
import { useNotification } from '../../context/NotificationProvider';
import { gsap } from 'gsap';
import './Toast.css';

export const Toast = () => {
  const { notifications, removeNotification } = useNotification();
  const toastRefs = useRef({});

  useEffect(() => {
    // Animate new toast when added
    notifications.forEach(notification => {
      const toastElement = toastRefs.current[notification.id];
      if (toastElement && !toastElement.dataset.animated) {
        // Mark as animated to prevent re-animation
        toastElement.dataset.animated = 'true';
        
        // Animation sequence
        gsap.fromTo(
          toastElement,
          { 
            x: 50, 
            opacity: 0,
            scale: 0.9 
          },
          { 
            x: 0, 
            opacity: 1, 
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          }
        );
      }
    });
  }, [notifications]);

  const handleClose = (id) => {
    const toastElement = toastRefs.current[id];
    
    // Animate out before removing
    gsap.to(toastElement, {
      x: 50,
      opacity: 0,
      scale: 0.9,
      duration: 0.2,
      onComplete: () => removeNotification(id)
    });
  };

  // If no notifications, don't render the container
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          ref={el => toastRefs.current[notification.id] = el}
          className={`toast toast-${notification.type}`}
        >
          <div className="toast-content">
            <p>{notification.message}</p>
          </div>
          <button 
            className="toast-close" 
            onClick={() => handleClose(notification.id)}
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;