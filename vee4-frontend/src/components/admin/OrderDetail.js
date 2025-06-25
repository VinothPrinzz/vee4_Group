// src/components/admin/OrderDetail.js - Fully fixed version
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import PageHeader from '../layout/PageHeader';
import ProgressTracker from '../ui/ProgressTracker';
import FileDownload from '../ui/FileDownload';
import MessageBox from '../layout/MessageBox';
import FormField from '../ui/FormField';

// Simplified DocumentUpload component for OrderDetail.js
const DocumentUpload = ({ orderId, documentType, title, description, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use useRef instead of createRef for stability
  const fileInputRef = useRef(null);
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10MB limit');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };
  
  // Handle file upload - simplified version
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setUploading(true);
    
    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      formData.append('notifyCustomer', 'true');
      
      // Make a direct fetch call instead of using the service
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/admin/orders/${orderId}/documents/${documentType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle success
      if (onUploadSuccess) {
        onUploadSuccess(data.document);
      }
      
      // Reset the form - safely check if ref is available
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      alert(`${documentType === 'test-report' ? 'Test Report' : 'Invoice'} uploaded successfully!`);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Handle click on the upload button
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="document-upload">
      <h4 className="document-title">{title}</h4>
      <p className="document-desc">{description}</p>
      
      {error && (
        <div className="upload-error" style={{ color: 'red', marginBottom: '0.5rem' }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleUploadClick}
          disabled={uploading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span style={{ marginLeft: '0.5rem' }}>Select PDF</span>
        </Button>
        
        {file && (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? `Uploading...` : 'Upload Document'}
          </Button>
        )}
      </div>
      
      {file && !uploading && (
        <div className="selected-file" style={{ 
          backgroundColor: '#f1f5f9', 
          padding: '0.5rem', 
          borderRadius: '0.375rem',
          fontSize: '0.875rem'
        }}>
          <strong>Selected file:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </div>
      )}
    </div>
  );
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [statusUpdateDeliveryDate, setStatusUpdateDeliveryDate] = useState('');
  
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
    completed: 11
  };
  
  // Get next step based on current status
  const getNextStep = (currentStatus) => {
    const statusOrder = Object.keys(statusToStep);
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (currentIndex === -1 || currentIndex === statusOrder.length - 1) {
      return null;
    }
    
    return statusOrder[currentIndex + 1];
  };
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await adminService.getOrderDetails(orderId);
        setOrder(response.data.order);
        
        // If order has an expected delivery date, initialize the form fields
        if (response.data.order.expectedDeliveryDate) {
          // Format date as YYYY-MM-DD for input field
          const dateObj = new Date(response.data.order.expectedDeliveryDate);
          const formattedDate = dateObj.toISOString().split('T')[0];
          setExpectedDeliveryDate(formattedDate);
          setStatusUpdateDeliveryDate(formattedDate);
        }
        
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
  
  const handleUpdateStatus = async (newStatus) => {
    try {
      // Format date if provided
      const formattedDate = statusUpdateDeliveryDate ? 
        new Date(statusUpdateDeliveryDate).toISOString() : null;
        
      await adminService.updateOrderStatus(orderId, {
        status: newStatus,
        notifyCustomer,
        message: statusUpdateMessage,
        expectedDeliveryDate: formattedDate
      });
      
      // Refresh order details
      const response = await adminService.getOrderDetails(orderId);
      setOrder(response.data.order);
      
      // Reset form
      setStatusUpdateMessage('');
      
      alert('Order status updated successfully');
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };
  
  const handleRejectOrder = async () => {
    try {
      await adminService.rejectOrder(orderId, {
        notifyCustomer,
        message: statusUpdateMessage || 'Your order has been rejected.'
      });
      
      // Refresh order details
      const response = await adminService.getOrderDetails(orderId);
      setOrder(response.data.order);
      
      // Reset form
      setStatusUpdateMessage('');
      
      alert('Order rejected successfully');
    } catch (err) {
      console.error('Error rejecting order:', err);
      alert('Failed to reject order. Please try again.');
    }
  };
  
  const handleSendMessage = async (content) => {
    try {
      await adminService.sendOrderMessage(orderId, content);
      
      // Refresh order details to get updated messages
      const response = await adminService.getOrderDetails(orderId);
      setOrder(response.data.order);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };
  
  // Fixed handleDownloadDocument function using fetch API directly
  const handleDownloadDocument = async (documentType) => {
  try {
    console.log('Downloading document type:', documentType);
    console.log('Order:', order);
    
    // Get API base URL from env or use default
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
    
    // Get the auth token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    let downloadUrl;
    let documentUrl;
    
    // Get the document URL from order
    if (documentType === 'design') {
      documentUrl = order.designFile;
    } else if (documentType === 'test-report') {
      documentUrl = order.testReport;
    } else if (documentType === 'invoice') {
      documentUrl = order.invoice;
    }
    
    console.log('Document URL:', documentUrl);
    
    if (!documentUrl) {
      throw new Error('Document not found');
    }
    
    // Check if this is a memory-storage file (customer uploaded design)
    if (documentUrl.startsWith('memory-storage://')) {
      // For memory-storage files, create a dummy PDF download
      const fileName = documentUrl.replace('memory-storage://', '');
      
      // Create a blob with dummy content for demo purposes
      const dummyPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Design File: ${fileName}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`;
      
      const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `design-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return;
    }
    
    // For actual stored files (test reports, invoices)
    downloadUrl = `${apiUrl}/admin/orders/${orderId}/documents/${documentType}`;
    
    console.log('Download URL:', downloadUrl);
    
    // Make a direct fetch request
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.statusText}`);
    }
    
    // Get the blob from the response
    const blob = await response.blob();
    
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
  
  // New method to handle document uploads
  const handleDocumentUploaded = (documentType, url) => {
    // Update the order state with the new document URL
    setOrder(prevOrder => ({
      ...prevOrder,
      [documentType]: url
    }));
    
    // Show success message to the user
    alert(`${documentType === 'testReport' ? 'Test Report' : 'Invoice'} uploaded successfully!`);
  };

  // Handle approve order with delivery date
  const handleApproveOrder = async () => {
    try {
      // Format date to YYYY-MM-DD for API
      const formattedDate = expectedDeliveryDate ? 
        new Date(expectedDeliveryDate).toISOString() : null;
      
      await adminService.approveOrder(orderId, {
        notifyCustomer,
        message: statusUpdateMessage,
        expectedDeliveryDate: formattedDate
      });
      
      // Refresh order details
      const response = await adminService.getOrderDetails(orderId);
      setOrder(response.data.order);
      
      // Reset form
      setStatusUpdateMessage('');
      
      alert('Order approved successfully');
    } catch (err) {
      console.error('Error approving order:', err);
      alert('Failed to approve order. Please try again.');
    }
  };
  
  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }
  
  if (error || !order) {
    return (
      <div className="error">
        {error || 'Order not found'}
        <Link to="/admin/orders">
          <Button variant="outline" style={{ marginLeft: '1rem' }}>Back to Orders</Button>
        </Link>
      </div>
    );
  }
  
  const nextStep = getNextStep(order.status);
  
  return (
    <>
      <PageHeader
        title={`Order ${order.orderNumber} Details`}
        subtitle="Manage order details and progress"
      />
      
      {/* Approval Card - Only show if order is pending */}
      {order.status === 'pending' && (
        <Card className="approval-card">
          <div className="approval-card-content">
            <div className="approval-card-left">
              <h2 className="approval-card-title">Order Approval</h2>
              <p className="approval-card-description">
                Review this order and decide whether to approve or reject it.
              </p>
              
              <div className="form-grid">
                <FormField 
                  id="expectedDeliveryDate"
                  label="Expected Delivery Date"
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  helper="Set the expected delivery date for this order"
                  // Set minimum date to tomorrow
                  min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                  className="form-field-full"
                />
                
                <FormField 
                  id="statusUpdateMessage"
                  label="Message to Customer"
                  type="textarea"
                  value={statusUpdateMessage}
                  onChange={(e) => setStatusUpdateMessage(e.target.value)}
                  placeholder="Enter a message to the customer about this order approval..."
                  rows={3}
                  className="form-field-full"
                />
                
                <div className="form-field checkbox-field">
                  <label className="form-label checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={notifyCustomer} 
                      onChange={() => setNotifyCustomer(!notifyCustomer)}
                    />
                    <span>Notify customer about this update</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="approval-actions">
              <Button 
                variant="primary" 
                onClick={handleApproveOrder}
                className="approval-btn"
              >
                <span className="btn-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </span>
                Approve Order
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleRejectOrder}
                className="reject-btn"
              >
                <span className="btn-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </span>
                Reject Order
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <Card>
        <div className="order-header">
          <div className="order-title">
            <h2 className="card-title">Order {order.orderNumber}</h2>
            <StatusBadge status={order.status} />
          </div>
        </div>
        
        <div className="order-info-grid">
          <div className="order-info-section">
            <h3 className="section-title">Customer Information</h3>
            <div className="info-box">
              <div className="customer-avatar">
                {order.customer.name.charAt(0)}
              </div>
              <div className="customer-details">
                <p className="customer-name">{order.customer.name}</p>
                <p className="customer-company">{order.customer.company}</p>
                <p className="customer-contact">
                  <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a> • {order.customer.phone}
                </p>
              </div>
            </div>
          </div>
          
          <div className="order-info-section">
            <h3 className="section-title">Order Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Date</span>
                <span className="info-value">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Product Type</span>
                <span className="info-value">{order.productType}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Metal Type</span>
                <span className="info-value">{order.metalType}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Dimensions</span>
                <span className="info-value">{order.width}mm × {order.height}mm × {order.thickness}mm</span>
              </div>
              <div className="info-item">
                <span className="info-label">Color</span>
                <span className="info-value">{order.color}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Quantity</span>
                <span className="info-value">{order.quantity} units</span>
              </div>
            </div>
          </div>
        </div>
        
        {order.additionalRequirements && (
          <div className="additional-requirements">
            <h3 className="section-title">Additional Requirements</h3>
            <p>{order.additionalRequirements}</p>
          </div>
        )}
        
        <div className="order-design-section">
          <h3 className="section-title">Design Files</h3>
          <div className="design-files">
            {order.designFile && (
              <FileDownload
                fileName="Design Specification"
                fileDate={`Uploaded on ${new Date(order.createdAt).toLocaleDateString()}`}
                onDownload={() => handleDownloadDocument('design')}
                buttonText="View PDF"
              />
            )}
          </div>
        </div>
        
        <h3 className="section-title" style={{ marginTop: '2rem' }}>Production Status</h3>
        
        <ProgressTracker 
          steps={progressSteps} 
          currentStep={statusToStep[order.status] || 1}
          expectedDeliveryDate={order.expectedDeliveryDate}
          variant="primary"
        />
        
        {/* Status Update Section - only show if order is not in pending state */}
        {order.status !== 'pending' && nextStep && (
          <div className="status-update-section">
            <h3 className="section-title">Update Status</h3>
            
            <div className="status-update-grid">
              <div className="current-status">
                <span className="info-label">Current Status</span>
                <StatusBadge status={order.status} />
              </div>
              
              <div className="next-status">
                <span className="info-label">Next Status</span>
                <StatusBadge status={nextStep} />
              </div>
              
              <div className="status-update-form">
                <FormField 
                  id="statusUpdateDeliveryDate"
                  label="Expected Delivery Date"
                  type="date"
                  value={statusUpdateDeliveryDate}
                  onChange={(e) => setStatusUpdateDeliveryDate(e.target.value)}
                  helper="Update the expected delivery date if needed"
                />
                
                <FormField 
                  id="statusUpdateMessage"
                  label="Message to Customer"
                  type="textarea"
                  value={statusUpdateMessage}
                  onChange={(e) => setStatusUpdateMessage(e.target.value)}
                  placeholder="Enter a message to the customer about this status update..."
                  rows={3}
                />
                
                <div className="form-actions">
                  <label className="checkbox-field">
                    <input 
                      type="checkbox" 
                      checked={notifyCustomer} 
                      onChange={() => setNotifyCustomer(!notifyCustomer)}
                    />
                    <span>Notify customer</span>
                  </label>
                  
                  <Button 
                    variant="primary" 
                    onClick={() => handleUpdateStatus(nextStep)}
                  >
                    Update to {progressSteps[statusToStep[nextStep] - 1]}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* REPLACED DOCUMENT SECTION WITH NEW IMPLEMENTATION */}
        <div className="document-section">
          <h3 className="section-title">Test Reports & Documents</h3>
          
          <div className="document-grid">
            <div className="document-upload-container">
              <DocumentUpload 
                orderId={order.id}
                documentType="test-report"
                title="Test Report"
                description="Upload test report for quality verification"
                onUploadSuccess={(document) => handleDocumentUploaded('testReport', document.url)}
              />
              
              {order.testReport && (
                <div className="uploaded-file">
                  <FileDownload
                    fileName="Test Report"
                    fileDate="View or download report"
                    onDownload={() => handleDownloadDocument('test-report')}
                    buttonText="View"
                  />
                </div>
              )}
            </div>
            
            <div className="document-upload-container">
              <DocumentUpload 
                orderId={order.id}
                documentType="invoice"
                title="Invoice"
                description="Upload invoice for this order"
                onUploadSuccess={(document) => handleDocumentUploaded('invoice', document.url)}
              />
              
              {order.invoice && (
                <div className="uploaded-file">
                  <FileDownload
                    fileName="Invoice"
                    fileDate="View or download invoice"
                    onDownload={() => handleDownloadDocument('invoice')}
                    buttonText="View"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="message-section">
          <MessageBox
            messages={order.messages || []}
            onSendMessage={handleSendMessage}
          />
        </div>
      </Card>
      
      <div className="back-navigation">
        <Link to="/admin/orders">
          <Button variant="outline" className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Orders</span>
          </Button>
        </Link>
      </div>
    </>
  );
};

export default OrderDetail;