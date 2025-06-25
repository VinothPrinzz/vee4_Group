// src/components/layout/MainLayout.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { authService, notificationService } from '../../services/api';

/**
 * Improved Main Layout with simplified header and fixed sidebar
 */
const MainLayout = ({ role = 'customer' }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  // Fetch user data and notifications
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get stored user from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser) {
          throw new Error('No user found');
        }
        
        // Verify stored user still has valid session
        const { data } = await authService.getCurrentUser();
        
        // Check if user has correct role
        if (data.user.role !== role) {
          throw new Error('Unauthorized');
        }
        
        setUser(data.user);
        
        // Get notifications if role is customer
        if (role === 'customer') {
          try {
            const notificationsResponse = await notificationService.getNotifications();
            setNotifications(notificationsResponse.data.notifications || []);
          } catch (notifError) {
            console.error('Error fetching notifications:', notifError);
            // Don't redirect on notification error
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setError(error.message);
        
        // Redirect to login
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate, role]);
  
  // Define menu items based on role
  const getMenuItems = () => {
    if (role === 'admin') {
      return [
        { 
          path: '/admin/orders', 
          label: 'Orders',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          ) 
        },
        { 
          path: '/admin/customers', 
          label: 'Customers',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          )
        },
        { 
          path: '/admin/notifications', 
          label: 'Notifications',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          ),
          badge: getUnreadNotificationsCount()
        },
        { 
          path: '/logout', 
          label: 'Logout',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          )
        }
      ];
    }
    
    return [
      { 
        path: '/orders', 
        label: 'My Orders',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        )
      },
      { 
        path: '/orders/new', 
        label: 'Place New Order',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        )
      },
      { 
        path: '/notifications', 
        label: 'Notifications',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        ),
        badge: getUnreadNotificationsCount()
      },
      { 
        path: '/logout', 
        label: 'Logout',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        )
      }
    ];
  };
  
  // Get unread notifications
  function getUnreadNotificationsCount() {
    return notifications.filter(notification => !notification.isRead).length;
  }
  
  // Get only unread notifications for header dropdown
  function getUnreadNotifications() {
    return notifications.filter(notification => !notification.isRead);
  }
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Title based on role
  const getHeaderTitle = () => {
    return role === 'admin' ? 'Vee4 Admin Dashboard' : 'Vee4 Order System';
  };
  
  if (loading) {
    return (
      <div className="full-page-loader">
        <div className="loader-content">
          <div className="loader-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="layout-container">
      <Sidebar 
        user={user} 
        menuItems={getMenuItems()}
        isMobileMenuOpen={isMobileMenuOpen}
        onItemClick={() => setIsMobileMenuOpen(false)}
      />
      
      <Header 
        title={getHeaderTitle()}
        notificationsCount={getUnreadNotificationsCount()}
        unreadNotifications={getUnreadNotifications()}
        onMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <div className="layout-body">  
        <main className={`main-content ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          {error && (
            <div className="layout-error">
              {error}
            </div>
          )}
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

MainLayout.propTypes = {
  role: PropTypes.oneOf(['customer', 'admin'])
};

export default MainLayout;