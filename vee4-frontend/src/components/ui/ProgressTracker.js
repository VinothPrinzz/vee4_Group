// src/components/ui/ProgressTracker.js
import React from 'react';
import PropTypes from 'prop-types';

const ProgressTracker = ({ 
  steps, 
  currentStep,
  compact = false,
  vertical = false,
  showLabels = true,
  variant = 'default', // default, primary, success
  expectedDeliveryDate = null // New prop for expected delivery date
}) => {
  // Calculate progress as a percentage
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;
  
  // Generate status for each step
  const getStepStatus = (stepNumber) => {
    if (stepNumber === currentStep) return 'active';
    if (stepNumber < currentStep) return 'completed';
    return 'pending';
  };
  
  // Format expected delivery date
  const formatDeliveryDate = (date) => {
    if (!date) return '';
    
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Variant classes for styling
  const variantClass = `progress-tracker-${variant}`;
  
  // Orientation classes
  const orientationClass = vertical ? 'progress-tracker-vertical' : 'progress-tracker-horizontal';
  
  // Compact mode class
  const sizeClass = compact ? 'progress-tracker-compact' : '';
  
  return (
    <div className={`progress-tracker ${variantClass} ${orientationClass} ${sizeClass}`}>
      {/* Progress Line */}
      <div className="progress-line">
        <div 
          className="progress-line-active" 
          style={{ width: vertical ? '100%' : `${progressPercentage}%`, height: vertical ? `${progressPercentage}%` : '100%' }}
        />
      </div>
      
      {/* Steps */}
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const status = getStepStatus(stepNumber);
        const isLastStep = stepNumber === steps.length;
        const deliveryInfo = isLastStep && expectedDeliveryDate ? 
          `Est: ${formatDeliveryDate(expectedDeliveryDate)}` : '';
        
        return (
          <div 
            key={stepNumber} 
            className={`progress-step step-${status}`}
            style={{ 
              zIndex: steps.length - index,
            }}
          >
            <div className="step-number">
              {status === 'completed' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                stepNumber
              )}
            </div>
            
            {showLabels && (
              <div className="step-label">
                {typeof step === 'string' ? step : step.label || `Step ${stepNumber}`}
                {deliveryInfo && (
                  <div className="step-delivery-date">{deliveryInfo}</div>
                )}
              </div>
            )}
            
            {/* Tooltip for compact mode */}
            {compact && !showLabels && (
              <div className="step-tooltip">
                {typeof step === 'string' ? step : step.label || `Step ${stepNumber}`}
                {deliveryInfo && ` (${deliveryInfo})`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

ProgressTracker.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        description: PropTypes.string
      })
    ])
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
  compact: PropTypes.bool,
  vertical: PropTypes.bool,
  showLabels: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'primary', 'success']),
  expectedDeliveryDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ])
};

export default ProgressTracker;