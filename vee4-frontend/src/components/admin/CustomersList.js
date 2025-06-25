// src/components/admin/CustomersList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PageHeader from '../layout/PageHeader';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllCustomers();
        setCustomers(response.data.customers);
        setError(null);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  const handleCustomerClick = (customerName) => {
    // Navigate to orders page with customer filter
    navigate(`/admin/orders?customer=${encodeURIComponent(customerName)}`);
  };
  
  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }
  
  return (
    <>
      <PageHeader
        title="Customer Management"
        subtitle="View and manage your customers"
      />
      
      <Card title="All Customers">
        {error && <div className="error">{error}</div>}
        
        <div className="table-container">
          <table style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '5%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCustomerClick(customer.name)}
                    className="customer-row"
                  >
                    <td style={{ 
                      fontWeight: '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {customer.name}
                    </td>
                    <td style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {customer.company}
                    </td>
                    <td style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.875rem'
                    }}>
                      {customer.email}
                    </td>
                    <td style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {customer.phone}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: customer.ordersCount > 0 ? '#e0f2fe' : '#f5f5f5',
                        color: customer.ordersCount > 0 ? '#0277bd' : '#666',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {customer.ordersCount}
                      </span>
                    </td>
                    <td style={{ 
                      fontSize: '0.875rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCustomerClick(customer.name)}
                      >
                        View Orders
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default CustomersList;