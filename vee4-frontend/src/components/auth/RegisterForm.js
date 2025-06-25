// src/components/auth/RegisterForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Check password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    // Password should have at least one uppercase, one lowercase, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Remove confirmPassword before sending
      const { confirmPassword, ...userData } = formData;
      
      await authService.register(userData);
      
      // Redirect to login page with success message
      navigate('/login', { 
        state: { message: 'Registration successful! Please login with your new account.' } 
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to register. Please check your information and try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <Card title="Create an Account">
        {error && (
          <div className="error-message" style={{ marginBottom: '1rem', color: 'red' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormField
            id="name"
            name="name"
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <FormField
            id="email"
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <FormField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <FormField
            id="company"
            name="company"
            label="Company Name"
            type="text"
            placeholder="Enter your company name"
            value={formData.company}
            onChange={handleChange}
            required
          />
          
          <FormField
            id="phone"
            name="phone"
            label="Phone Number"
            type="text"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          
          <div style={{ marginTop: '1.5rem' }}>
            <Button 
              type="submit" 
              variant="primary" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            Already have an account?{' '}
            <a href="/login" className="auth-link">
              Login here
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterForm;