// src/components/layout/Header.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Simplified Header component with only notifications icon
 */
const Header = ({ 
  title = "Vee4 Order System",
  notificationsCount = 0,
  unreadNotifications = [],
  onMenuToggle,
  isMobileMenuOpen = false
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isNotificationsOpen && 
        event.target.closest('.notifications-container') === null
      ) {
        setIsNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);
  
  // Toggle notifications panel
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };
  
  // Toggle mobile menu
  const handleMenuToggle = () => {
    if (onMenuToggle) onMenuToggle();
  };
  
  // Format notification time
  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <header className={`main-header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-content">
        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={handleMenuToggle}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        {/* Title */}
        <h1 className="header-title">{title}</h1>
        
        {/* Notifications Only */}
        <div className="notifications-container">
          <button 
            className={`notifications-toggle ${isNotificationsOpen ? 'active' : ''}`}
            onClick={toggleNotifications}
            aria-label="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            
            {notificationsCount > 0 && (
              <span className="notifications-badge">{notificationsCount}</span>
            )}
          </button>
          
          {/* Notifications Dropdown - Only shows UNREAD notifications */}
          {isNotificationsOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Unread Notifications ({notificationsCount})</h3>
                <Link to="/notifications" onClick={() => setIsNotificationsOpen(false)}>
                  View all
                </Link>
              </div>
              
              <div className="notifications-list">
                {notificationsCount > 0 ? (
                  unreadNotifications.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      <div className={`notification-icon ${notification.type}-icon`}></div>
                      <div className="notification-content">
                        <p className="notification-text">{notification.message}</p>
                        <span className="notification-time">{formatTime(notification.createdAt)}</span>
                      </div>
                      {notification.orderId && (
                        <Link 
                          to={`/orders/${notification.orderId}`} 
                          className="btn-view"
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          View
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-notifications">
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  notificationsCount: PropTypes.number,
  unreadNotifications: PropTypes.array,
  onMenuToggle: PropTypes.func,
  isMobileMenuOpen: PropTypes.bool
};

export default Header;