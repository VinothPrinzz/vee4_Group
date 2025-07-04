// src/components/customer/OrderDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import PageHeader from '../layout/PageHeader';
import ProgressTracker from '../ui/ProgressTracker';
import FileDownload from '../ui/FileDownload';
import MessageBox from '../layout/MessageBox';

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  
  // Define progress steps
  const progressSteps = [
    "Order Received",
    "Approved", 
    "Designing",
    "Laser Cutting",
    "Metal Bending",
    "Fabrication (Welding)",
    "Finishing",
    "Powder Coating", 
    "Assembling",
    "Quality Check",
    "Dispatch"
  ];
  
  // Map status to step number
  const statusToStep = {
    pending: 1,
    approved: 2,
    designing: 3,
    laser_cutting: 4,
    metal_bending: 5,
    fabrication_welding: 6,
    finishing: 7,
    powder_coating: 8,
    assembling: 9,
    quality_check: 10,
    dispatch: 11,
    completed: 11,
    cancelled: 1,
    rejected: 1
  };
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrderDetails(orderId);
        setOrder(response.data.order);
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  const handleSendMessage = async (content) => {
    try {
      await orderService.sendOrderMessage(orderId, content);
      
      // Refresh order details to get updated messages
      const response = await orderService.getOrderDetails(orderId);
      setOrder(response.data.order);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };
  
  const handleDownloadDocument = async (documentType) => {
    try {
      const response = await orderService.downloadDocument(orderId, documentType);
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and click it to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentType}-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document. Please try again.');
    }
  };

  const canCancelOrder = () => {
    if (!order) return false;
    const cancellableStatuses = ['pending', 'approved', 'designing'];
    return cancellableStatuses.includes(order.status);
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      
      // Validate on frontend before API call
      if (!canCancelOrder()) {
        alert('Order cannot be cancelled at this stage. Please contact support for assistance.');
        return;
      }
      
      const response = await orderService.cancelOrder(orderId, { reason: cancellationReason });
      
      if (response.data.success) {
        // Refresh order details
        const orderResponse = await orderService.getOrderDetails(orderId);
        setOrder(orderResponse.data.order);
        setShowCancelModal(false);
        setCancellationReason('');
        alert('Order cancelled successfully');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      if (err.response?.status === 404) {
        alert('Cancellation service is not available. Please contact support.');
      } else if (err.response?.status === 400) {
        alert(err.response?.data?.message || 'Order cannot be cancelled at this stage.');
      } else {
        alert('Failed to cancel order. Please try again or contact support.');
      }
    } finally {
      setCancelling(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }
  
  if (error || !order) {
    return (
      <div className="error">
        {error || 'Order not found'}
        <Link to="/orders">
          <Button variant="outline" style={{ marginLeft: '1rem' }}>Back to Orders</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <PageHeader
        title={`Order ${order.orderNumber} Details`}
        subtitle="View your order details and status"
      />
      
      <Card title={`Order ${order.orderNumber}`}>
        <div className="order-header">
          <div className="order-title">
            <div className="detail-group">
              <p className="detail-label">Date</p>
              <p className="detail-value">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className="detail-group">
              <p className="detail-label">Status</p>
              <p className="detail-value"><StatusBadge status={order.status} /></p>
            </div>
          </div>
          
          {canCancelOrder() && (
            <div className="order-actions">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelModal(true)}
                style={{ 
                  color: '#ef4444', 
                  borderColor: '#ef4444',
                  fontSize: '0.875rem'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Cancel Order
              </Button>
            </div>
          )}
        </div>

        {/* Adds expected delivery date if it exists */}
        {order.expectedDeliveryDate && (
          <div className="detail-group">
            <p className="detail-label">Expected Delivery</p>
            <p className="detail-value">
              {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}
        
        <div className="order-details">
          <div>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Order Details</h3>
            
            <div className="detail-group">
              <p className="detail-label">Product Type</p>
              <p className="detail-value">{order.productType}</p>
            </div>
            
            <div className="detail-group">
              <p className="detail-label">Metal Type</p>
              <p className="detail-value">{order.metalType}</p>
            </div>
            
            <div className="detail-group">
              <p className="detail-label">Size</p>
              <p className="detail-value">{order.width}mm x {order.height}mm</p>
            </div>
            
            <div className="detail-group">
              <p className="detail-label">Thickness</p>
              <p className="detail-value">{order.thickness}mm</p>
            </div>
            
            <div className="detail-group">
              <p className="detail-label">Color</p>
              <p className="detail-value">{order.color}</p>
            </div>
            
            <div className="detail-group">
              <p className="detail-label">Quantity</p>
              <p className="detail-value">{order.quantity} units</p>
            </div>
            
            {order.additionalRequirements && (
              <div className="detail-group">
                <p className="detail-label">Additional Requirements</p>
                <p className="detail-value">{order.additionalRequirements}</p>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Uploaded Design</h3>
            {order.designFile && (
              <FileDownload
                fileName="design-specification.pdf"
                fileDate={`Uploaded on ${new Date(order.createdAt).toLocaleDateString()}`}
                onDownload={() => handleDownloadDocument('design')}
                buttonText="View PDF"
              />
            )}
          </div>
        </div>
        
        {order.status !== 'cancelled' && order.status !== 'rejected' && (
          <>
            <h3 className="card-title" style={{ margin: '1.5rem 0 1rem' }}>Production Status</h3>
            
            <ProgressTracker 
              steps={progressSteps} 
              currentStep={statusToStep[order.status] || 1}
              expectedDeliveryDate={order.expectedDeliveryDate}
            />

            {order.expectedDeliveryDate && order.status !== 'rejected' && (
              <div className="expected-delivery-highlight">
                <span className="delivery-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </span>
                Expected Delivery: {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                
                {/* Add countdown if delivery date is in the future */}
                {new Date(order.expectedDeliveryDate) > new Date() && (
                  <span className="date-countdown">
                    {Math.ceil((new Date(order.expectedDeliveryDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {(order.status === 'cancelled' || order.status === 'rejected') && (
          <div className="order-terminated">
            <h3 className="card-title" style={{ margin: '1.5rem 0 1rem' }}>
              Order {order.status === 'cancelled' ? 'Cancelled' : 'Rejected'}
            </h3>
            <div className={`alert alert-${order.status === 'cancelled' ? 'warning' : 'danger'}`}>
              {order.status === 'cancelled' ? (
                <>
                  <p>This order has been cancelled{order.cancelledAt ? ` on ${new Date(order.cancelledAt).toLocaleDateString()}` : ''}.</p>
                  {order.cancellationReason && (
                    <p><strong>Reason:</strong> {order.cancellationReason}</p>
                  )}
                </>
              ) : (
                <p>This order has been rejected. Please contact support for more information.</p>
              )}
            </div>
          </div>
        )}
        
        <div className="document-section">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Documents & Reports</h3>
          
          {(!order.testReport && !order.invoice) ? (
            <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem' }}>Test reports and invoice will be available once the order is processed. You can download them from here.</p>
            </div>
          ) : (
            <>
              {order.testReport && (
                <FileDownload
                  fileName="quality-test-report.pdf"
                  fileDate="Quality test report"
                  onDownload={() => handleDownloadDocument('test-report')}
                  buttonText="Download"
                />
              )}
              
              {order.invoice && (
                <FileDownload
                  fileName={`invoice-${order.orderNumber}.pdf`}
                  fileDate="Invoice"
                  onDownload={() => handleDownloadDocument('invoice')}
                  buttonText="Download"
                />
              )}
            </>
          )}
        </div>
        
        <div style={{ marginTop: '1.5rem' }}>
          <MessageBox
            messages={order.messages || []}
            onSendMessage={handleSendMessage}
            currentUserRole="customer"
          />
        </div>
      </Card>
      
      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Order</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowCancelModal(false)}
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to cancel order <strong>{order.orderNumber}</strong>?</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                This action cannot be undone. Once cancelled, you'll need to place a new order.
              </p>
              
              <div style={{ marginTop: '1.5rem' }}>
                <label htmlFor="cancellationReason" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Cancellation Reason (Optional)
                </label>
                <textarea
                  id="cancellationReason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please let us know why you're cancelling this order..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Order
              </Button>
              <Button 
                variant="danger" 
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/orders">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </>
  );
};

export default OrderDetail;