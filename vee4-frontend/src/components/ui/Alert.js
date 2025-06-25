// src/components/ui/Alert.js
import React from 'react';
import PropTypes from 'prop-types';

const Alert = ({ 
  type = 'info', 
  children,
  className = '' 
}) => {
  return (
    <div className={`alert alert-${type} ${className}`}>
      {children}
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default Alert;