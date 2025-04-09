import React from 'react';
import './auth.css'; // Make sure to add the styles to your CSS file

/**
 * Component to display field requirements with validation status
 * 
 * @param {Object} props - Component props
 * @param {Array} props.requirements - List of requirement texts
 * @param {Array} props.status - List of statuses ('valid', 'invalid', or '')
 * @param {boolean} props.visible - Whether the hints should be visible
 * @param {string} props.className - Additional CSS class
 */
const FieldRequirementHints = ({ 
  requirements = [],
  status = [],
  visible = false,
  className = ''
}) => {
  if (!visible || requirements.length === 0) {
    return null;
  }

  return (
    <div className={`field-requirements ${className}`}>
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

export default FieldRequirementHints;
