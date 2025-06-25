// src/components/admin/NotificationsList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PageHeader from '../layout/PageHeader';

const NotificationItem = ({ notification, onMarkAsRead, onViewOrder }) => {
  // Use _id instead of id to match MongoDB format
  const { _id, title, message, isRead, type, orderId, createdAt } = notification;
  
  // Format date
  const formattedDate = new Date(createdAt).toLocaleString();
  
  return (
    <div className={`notification-item ${isRead ? 'read' : 'unread'}`}>
      <div className="notification-content">
        <h4 className="notification-title">{title}</h4>
        <p className="notification-message">{message}</p>
        <div className="notification-meta">
          <span className="notification-time">{formattedDate}</span>
          {!isRead && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onMarkAsRead(_id)}
            >
              Mark as Read
            </Button>
          )}
        </div>
      </div>
      
      {orderId && (
        <div className="notification-actions">
          <Link 
            to={`/admin/orders/${orderId}`}
            onClick={() => onViewOrder(_id)}
          >
            <Button variant="outline" size="sm">View Order</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

const AdminNotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationService.getNotifications();
        const fetchedNotifications = response.data.notifications || [];
        setNotifications(fetchedNotifications);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      console.log('Marking notification as read:', notificationId);
      await notificationService.markAsRead(notificationId);
      
      // Update only the specific notification in the list
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      alert('Failed to mark notification as read. Please try again.');
    }
  };
  
  const handleViewOrder = async (notificationId) => {
    // Auto-mark notification as read when viewing the order
    const notification = notifications.find(n => n._id === notificationId);
    if (notification && !notification.isRead) {
      try {
        await notificationService.markAsRead(notificationId);
        
        // Update only this specific notification as read
        setNotifications(prevNotifications => 
          prevNotifications.map(n => 
            n._id === notificationId 
              ? { ...n, isRead: true }
              : n
          )
        );
      } catch (err) {
        console.error('Error auto-marking notification as read:', err);
        // Don't show error to user for auto-mark failure
      }
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update all notifications as read
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      alert('Failed to mark all notifications as read. Please try again.');
    }
  };
  
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }
  
  return (
    <>
      <PageHeader
        title="Admin Notifications"
        subtitle="Stay updated with new orders and customer messages"
      />
      
      <Card 
        title={`Notifications (${unreadCount} unread)`}
        action={
          unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          )
        }
      >
        {error && <div className="error">{error}</div>}
        
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onViewOrder={handleViewOrder}
              />
            ))
          )}
        </div>
      </Card>
    </>
  );
};

export default AdminNotificationsList;