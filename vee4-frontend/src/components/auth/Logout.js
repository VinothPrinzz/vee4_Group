// src/components/auth/Logout.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const Logout = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Always navigate to login page, even if logout API fails
        navigate('/login');
      }
    };
    
    performLogout();
  }, [navigate]);
  
  // Return null as this component doesn't render anything
  return null;
};

export default Logout;