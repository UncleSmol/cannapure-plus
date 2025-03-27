import React from 'react';
import PropTypes from 'prop-types';

/**
 * Debug panel for displaying category counts and debugging actions
 */
const DebugPanel = ({ categoryCounts, onLogData, onRefresh }) => {
  // return (
  //   <div className="debug-panel">
  //     <h4>Category Counts</h4>
  //     <ul>
  //       {Object.entries(categoryCounts).map(([category, count]) => (
  //         <li key={category}>
  //           {category}: {count}
  //         </li>
  //       ))}
  //     </ul>
  //     <div className="debug-actions">
  //       <button onClick={onLogData}>Log Data</button>
  //       <button onClick={onRefresh}>Force Refresh</button>
  //     </div>
  //   </div>
  // );
};

DebugPanel.propTypes = {
  categoryCounts: PropTypes.object.isRequired,
  onLogData: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired
};

export default DebugPanel;
