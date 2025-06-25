// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import MainLayout from './components/layout/MainLayout';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Logout from './components/auth/Logout';

// Customer Components
import OrdersList from './components/customer/OrdersList';
import OrderDetail from './components/customer/OrderDetail';
import NewOrderForm from './components/customer/NewOrderForm';
import NotificationsList from './components/customer/NotificationsList';

// Admin Components
import AdminOrdersList from './components/admin/OrdersList';
import AdminOrderDetail from './components/admin/OrderDetail';
import CustomersList from './components/admin/CustomersList';
import AdminNotificationsList from './components/admin/NotificationsList';

// Protected Route Component
const ProtectedRoute = ({ element, redirectPath = '/login' }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return element;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/logout" element={<Logout />} />
        
        {/* Customer Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute 
              element={<MainLayout role="customer" />} 
            />
          }
        >
          <Route index element={<Navigate to="/orders" replace />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="orders/new" element={<NewOrderForm />} />
          <Route path="notifications" element={<NotificationsList />} />
        </Route>
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute 
              element={<MainLayout role="admin" />} 
            />
          }
        >
          <Route index element={<Navigate to="/admin/orders" replace />} />
          <Route path="orders" element={<AdminOrdersList />} />
          <Route path="orders/:orderId" element={<AdminOrderDetail />} />
          <Route path="customers" element={<CustomersList />} />
          <Route path="notifications" element={<AdminNotificationsList />} />
        </Route>
        
        {/* Redirect to Login for any unknown route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;