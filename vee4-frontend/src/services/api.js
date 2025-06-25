// src/services/api.js

import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://vee4group-backend.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration or unauthorized access
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication Services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return api.post('/auth/logout');
  },
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData)
};

// Orders Services (Customer)
export const orderService = {
  getAllOrders: () => api.get('/orders'),
  getOrderDetails: (orderId) => api.get(`/orders/${orderId}`),
  placeNewOrder: (orderData) => {
    const formData = new FormData();
    
    // Append order details to the form data
    Object.keys(orderData).forEach(key => {
      if (key !== 'designFile') {
        formData.append(key, orderData[key]);
      }
    });
    
    // Append the design file if it exists
    if (orderData.designFile) {
      formData.append('designFile', orderData.designFile);
    }
    
    return api.post('/orders', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getOrderMessages: (orderId) => api.get(`/orders/${orderId}/messages`),
  sendOrderMessage: (orderId, messageContent) => 
    api.post(`/orders/${orderId}/messages`, { content: messageContent }),
  getOrderDocuments: (orderId) => api.get(`/orders/${orderId}/documents`),
  downloadDocument: (orderId, documentType) => 
    api.get(`/orders/${orderId}/documents/${documentType}`, { responseType: 'blob' }),
  cancelOrder: (orderId, data) => 
    api.put(`/orders/${orderId}/cancel`, data)
};

// Admin Services
export const adminService = {
  getAllOrders: (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to params if they exist
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    return api.get('/admin/orders', { params });
  },
  getOrderDetails: (orderId) => api.get(`/admin/orders/${orderId}`),
  updateOrderStatus: (orderId, statusData) => 
    api.put(`/admin/orders/${orderId}/status`, statusData),
  approveOrder: (orderId, messageData) => 
    api.put(`/admin/orders/${orderId}/approve`, messageData),
  rejectOrder: (orderId, messageData) => 
    api.put(`/admin/orders/${orderId}/reject`, messageData),
  sendOrderMessage: (orderId, messageContent) => 
    api.post(`/admin/orders/${orderId}/messages`, { content: messageContent }),
  downloadDocument: (orderId, documentType) => 
    api.get(`/admin/orders/${orderId}/documents/${documentType}`, { 
      responseType: 'blob' 
    }),
    uploadOrderDocument: (orderId, documentType, file, notifyCustomer = true) => {
      // Create FormData properly
      const formData = new FormData();
      
      // Add the file to FormData
      formData.append('file', file);
      formData.append('notifyCustomer', notifyCustomer);
      
      // Return the API call with correct Content-Type header
      return api.post(
        `/admin/orders/${orderId}/documents/${documentType}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
    },
  getAllCustomers: () => api.get('/admin/customers')
};

// Notification Services
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) => {
    console.log('API Service - Marking notification as read:', notificationId); // Debug log
    return api.put(`/notifications/${notificationId}/read`);
  },
  markAllAsRead: () => {
    console.log('API Service - Marking all notifications as read'); // Debug log
    return api.put('/notifications/read-all');
  }
};

export default api;