// src/components/auth/LoginForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';

const LoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(formData);
      
      // Store token and user in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect based on user role
      if (response.data.user.role === 'admin') {
        navigate('/admin/orders');
      } else {
        navigate('/orders');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to login. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <Card title="Login to Your Account">
        {error && (
          <div className="error-message" style={{ marginBottom: '1rem', color: 'red' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
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
          
          <FormField
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
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
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Register now</Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;