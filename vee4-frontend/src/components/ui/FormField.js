// src/components/ui/FormField.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const FormField = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helper,
  success,
  required = false,
  disabled = false,
  readOnly = false,
  options = [],
  rows = 4,
  className = '',
  labelClassName = '',
  inputClassName = '',
  width = 'full',
  autoFocus = false,
  icon = null,
  iconPosition = 'left',
  // For number inputs
  min,
  max,
  step,
  // For date/time inputs
  minDate,
  maxDate,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Base classes
  const fieldClassName = `form-field form-field-${width} ${className}`;
  const labelClass = `form-label ${labelClassName} ${required ? 'required' : ''}`;
  
  // Input class based on state and type
  const getInputClass = () => {
    let classes = 'form-control';
    if (error) classes += ' form-control-error';
    if (success) classes += ' form-control-success';
    if (focused) classes += ' form-control-focused';
    if (disabled) classes += ' form-control-disabled';
    if (readOnly) classes += ' form-control-readonly';
    if (icon) classes += ` form-control-with-icon form-control-icon-${iconPosition}`;
    
    return `${classes} ${inputClassName}`;
  };
  
  const handleFocus = () => {
    setFocused(true);
  };
  
  const handleBlur = () => {
    setFocused(false);
  };
  
  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(!showPassword);
  };
  
  // Password visibility toggle button
  const renderPasswordToggle = () => (
    <button
      type="button"
      className="form-password-toggle"
      onClick={togglePasswordVisibility}
      tabIndex="-1"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      )}
    </button>
  );
  
  // Field icon
  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <div className={`form-field-icon icon-${iconPosition}`}>
        {icon}
      </div>
    );
  };
  
  // Render appropriate field based on type
  const renderField = () => {
    const inputProps = {
      id,
      name: id,
      placeholder,
      value: value || '',
      onChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      disabled,
      readOnly,
      required,
      className: getInputClass(),
      autoFocus,
      ...props
    };
    
    // Adjust specific props based on field type
    if (type === 'number') {
      inputProps.min = min;
      inputProps.max = max;
      inputProps.step = step;
    } else if (type === 'date' || type === 'datetime-local') {
      inputProps.min = minDate;
      inputProps.max = maxDate;
    }
    
    switch (type) {
      case 'select':
        return (
          <div className="form-select-container">
            <select {...inputProps}>
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              
              {options.map((option) => (
                <option 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
        
      case 'textarea':
        return (
          <div className="form-textarea-container">
            <textarea
              {...inputProps}
              rows={rows}
            />
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="form-checkbox-container">
            <input
              {...inputProps}
              type="checkbox"
              checked={!!value}
              className="form-checkbox"
            />
            <div className="form-checkbox-custom"></div>
          </div>
        );
        
      case 'radio':
        return (
          <div className="form-radio-container">
            <input
              {...inputProps}
              type="radio"
              checked={!!value}
              className="form-radio"
            />
            <div className="form-radio-custom"></div>
          </div>
        );
        
      case 'password':
        return (
          <div className="form-password-container">
            <input
              {...inputProps}
              type={showPassword ? 'text' : 'password'}
            />
            {renderPasswordToggle()}
          </div>
        );
        
      default:
        return (
          <div className="form-input-container">
            <input
              {...inputProps}
              type={type}
            />
          </div>
        );
    }
  };
  
  return (
    <div className={fieldClassName}>
      {label && (type !== 'checkbox' && type !== 'radio') && (
        <label htmlFor={id} className={labelClass}>
          {label}
          {required && <span className="form-required-indicator">*</span>}
        </label>
      )}
      
      <div className="form-field-wrapper">
        {icon && iconPosition === 'left' && renderIcon()}
        {renderField()}
        {icon && iconPosition === 'right' && renderIcon()}
      </div>
      
      {(type === 'checkbox' || type === 'radio') && label && (
        <label htmlFor={id} className={`${labelClass} form-check-label`}>
          {label}
          {required && <span className="form-required-indicator">*</span>}
        </label>
      )}
      
      {error && <div className="form-error">{error}</div>}
      {!error && helper && <div className="form-helper">{helper}</div>}
      {success && <div className="form-success">{success}</div>}
    </div>
  );
};

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.node,
  type: PropTypes.oneOf([
    'text', 'password', 'email', 'number', 'tel', 'url',
    'date', 'time', 'datetime-local', 'month', 'week',
    'select', 'textarea', 'checkbox', 'radio', 'color',
    'range', 'file', 'search'
  ]),
  placeholder: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.node,
  helper: PropTypes.node,
  success: PropTypes.node,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool
    })
  ),
  rows: PropTypes.number,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  width: PropTypes.oneOf(['full', 'auto', 'small', 'medium', 'large']),
  autoFocus: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minDate: PropTypes.string,
  maxDate: PropTypes.string
};

export default FormField;