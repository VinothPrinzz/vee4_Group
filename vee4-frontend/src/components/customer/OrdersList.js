// src/components/customer/OrdersList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import PageHeader from '../layout/PageHeader';

/**
 * Improved OrdersList component with better alignment and spacing
 */
const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getAllOrders();
        setOrders(response.data.orders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  if (loading) {
    return (
      <div className="card-container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }
  
  return (
    <>
      <PageHeader
        title="Customer Dashboard"
        subtitle="View and manage your orders"
      />
      
      <div className="card-container">
        <Card 
          title="Recent Orders"
          action={
            <Button 
              variant="primary"
              onClick={() => navigate('/orders/new')}
            >
              Place New Order
            </Button>
          }
        >
          {error && <div className="error">{error}</div>}
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>ORDER ID</th>
                  <th style={{ width: '25%' }}>DATE</th>
                  <th style={{ width: '30%' }}>STATUS</th>
                  <th style={{ width: '20%' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>
                      No orders found. Place your first order now!
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.orderNumber}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td>
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
};

export default OrdersList;