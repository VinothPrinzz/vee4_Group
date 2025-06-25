// src/components/ui/Card.js
import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  title, 
  subtitle,
  action,
  className = '',
  variant = 'default',
  padding = 'default',
  noBorder = false,
  elevation = 'default',
  isLoading = false
}) => {
  // Card style variants
  const variantClasses = {
    default: '',
    primary: 'card-primary',
    secondary: 'card-secondary',
    info: 'card-info',
    success: 'card-success',
    warning: 'card-warning',
    danger: 'card-danger'
  };
  
  // Padding options
  const paddingClasses = {
    default: '',
    small: 'card-padding-sm',
    large: 'card-padding-lg',
    none: 'card-padding-none'
  };
  
  // Elevation (shadow) options
  const elevationClasses = {
    default: '',
    none: 'card-elevation-none',
    low: 'card-elevation-low',
    high: 'card-elevation-high'
  };
  
  // Border option
  const borderClass = noBorder ? 'card-no-border' : '';
  
  // Combine all classes
  const cardClass = `
    card 
    ${variantClasses[variant]} 
    ${paddingClasses[padding]} 
    ${elevationClasses[elevation]} 
    ${borderClass} 
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cardClass}>
        <div className="card-skeleton-header">
          <div className="card-skeleton-title"></div>
          {action && <div className="card-skeleton-action"></div>}
        </div>
        <div className="card-skeleton-content">
          <div className="card-skeleton-line"></div>
          <div className="card-skeleton-line"></div>
          <div className="card-skeleton-line"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cardClass}>
      {(title || subtitle || action) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'info', 'success', 'warning', 'danger']),
  padding: PropTypes.oneOf(['default', 'small', 'large', 'none']),
  noBorder: PropTypes.bool,
  elevation: PropTypes.oneOf(['default', 'none', 'low', 'high']),
  isLoading: PropTypes.bool
};

export default Card;