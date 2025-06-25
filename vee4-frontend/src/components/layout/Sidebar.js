// src/components/layout/Sidebar.js
import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ 
  user, 
  menuItems, 
  isMobileMenuOpen = false,
  onItemClick
}) => {
  const location = useLocation();
  
  // Get the first letter of name for avatar placeholder
  const avatarText = user?.name ? user.name.charAt(0).toUpperCase() : '';
  
  // Check if a menu item is active
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  return (
    <aside className={`sidebar ${isMobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
      {/* Simplified user profile section */}
      <div className="user-profile">
        <div className="user-avatar">{avatarText}</div>
        <div className="user-info">
          <h3 className="user-name">{user.name}</h3>
          <p className="user-role">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
        </div>
      </div>
      
      {/* Navigation menu */}
      <nav className="sidebar-menu">
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item.path} className="menu-item-container">
              <Link 
                to={item.path} 
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={onItemClick}
              >
                <span className="menu-item-icon">{item.icon}</span>
                <span className="menu-item-label">{item.label}</span>
                {item.badge > 0 && (
                  <span className="menu-item-badge">{item.badge}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer with version */}
      <div className="sidebar-footer">
        <div className="version-info">v1.0.0</div>
        <div className="copyright">© 2025 Vee4 Group</div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string
  }),
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      badge: PropTypes.number
    })
  ).isRequired,
  isMobileMenuOpen: PropTypes.bool,
  onItemClick: PropTypes.func
};

export default Sidebar;