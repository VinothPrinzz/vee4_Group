// src/components/customer/NewOrderForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import FileUpload from '../ui/FileUpload';
import Alert from '../ui/Alert';
import PageHeader from '../layout/PageHeader';

const NewOrderForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    productType: 'sheet_metal', // Set actual default value, not empty
    metalType: 'stainless_steel', // Set actual default value, not empty
    thickness: '',
    width: '',
    height: '',
    quantity: '',
    color: '',
    additionalRequirements: '',
    designFile: null
  });
  
  const productTypes = [
    // Remove the empty placeholder option since we have a default
    { value: 'sheet_metal', label: 'Sheet Metal' },
    { value: 'fabrication', label: 'Metal Fabrication' },
    { value: 'panel', label: 'Electric Panel' }
  ];
  
  const metalTypes = [
    // Remove the empty placeholder option since we have a default
    { value: 'stainless_steel', label: 'Stainless Steel' },
    { value: 'mild_steel', label: 'Mild Steel' },
    { value: 'aluminum', label: 'Aluminum' }
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`${name} changed to: "${value}"`);
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (file) => {
    console.log('File changed:', file ? file.name : 'None');
    setFormData(prev => ({ ...prev, designFile: file }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form data being submitted:", formData);
    
    if (!formData.designFile) {
      setError('Please upload a design specification file');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.placeNewOrder(formData);
      
      // Navigate to the order detail page
      navigate(`/orders/${response.data.order.id}`);
    } catch (err) {
      console.error('Error placing order:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to place order. Please check your inputs and try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <PageHeader
        title="Place New Order"
        subtitle="Provide specifications for your custom metal product"
      />
      
      <Card>
        <Alert type="info">
          <strong>Note:</strong> Please provide accurate specifications and upload a detailed design document for quick processing of your order.
        </Alert>
        
        <form onSubmit={handleSubmit}>
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Product Specifications</h3>
          
          {error && (
            <Alert type="danger" className="mb-4">
              {error}
            </Alert>
          )}
          
          <FormField
            id="productType"
            name="productType"
            label="Product Type"
            type="select"
            value={formData.productType}
            onChange={handleChange}
            options={productTypes}
            required
          />
          
          <FormField
            id="metalType"
            name="metalType"
            label="Metal Type"
            type="select"
            value={formData.metalType}
            onChange={handleChange}
            options={metalTypes}
            required
          />
          
          <FormField
            id="thickness"
            name="thickness"
            label="Thickness (mm)"
            type="number"
            placeholder="e.g. 2.5"
            value={formData.thickness}
            onChange={handleChange}
            required
            min="0.1"
            step="0.1"
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <FormField
              id="width"
              name="width"
              label="Width (mm)"
              type="number"
              placeholder="Width"
              value={formData.width}
              onChange={handleChange}
              required
              min="1"
            />
            
            <FormField
              id="height"
              name="height"
              label="Height (mm)"
              type="number"
              placeholder="Height"
              value={formData.height}
              onChange={handleChange}
              required
              min="1"
            />
            
            <FormField
              id="quantity"
              name="quantity"
              label="Quantity"
              type="number"
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
          
          <FormField
            id="color"
            name="color"
            label="Color"
            type="text"
            placeholder="e.g. Grey Metallic, RAL 7045"
            value={formData.color}
            onChange={handleChange}
            required
          />
          
          <h3 className="card-title" style={{ margin: '1.5rem 0' }}>Design Specifications</h3>
          
          <div className="form-row">
            <label className="form-label">Upload Design File (PDF)</label>
            <FileUpload
              accept=".pdf"
              maxSize={10}
              onChange={handleFileChange}
            />
          </div>
          
          <FormField
            id="additionalRequirements"
            name="additionalRequirements"
            label="Additional Requirements"
            type="textarea"
            placeholder="Please describe any additional requirements or specifications..."
            value={formData.additionalRequirements}
            onChange={handleChange}
            rows={4}
          />
          
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button type="button" variant="outline" onClick={() => navigate('/orders')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Order'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
};

export default NewOrderForm;