// server/routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { upload, addLocationToFile } = require('../utils/fileUpload');
const notificationService = require('../utils/emailService');
const path = require('path');
const fs = require('fs');

// @route   GET /api/v1/orders
// @desc    Get all orders for current customer
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/v1/orders/:id
// @desc    Get specific order details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    
    // Check if customer owns the order
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order',
      });
    }
    
    // Get messages for this order
    const messages = await Message.find({ orderId: order._id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name role');
    
    // Format messages
    const formattedMessages = messages.map(message => ({
      id: message._id,
      sender: {
        id: message.senderId._id,
        name: message.senderId.role === 'admin' ? 'Vee4 Admin' : message.senderId.name,
      },
      content: message.content,
      createdAt: message.createdAt,
      isSystemMessage: message.isSystemMessage || false, // ADD THIS LINE
    }));
    
    // Prepare progress steps based on status
    const progressSteps = [
      { step: 1, name: 'Order Received', completed: true },
      { step: 2, name: 'Approved', completed: order.status !== 'pending' && order.status !== 'rejected' && order.status !== 'cancelled' },
      { step: 3, name: 'Designing', completed: ['designing', 'laser_cutting', 'metal_bending', 'fabrication_welding', 'finishing', 'powder_coating', 'assembling', 'quality_check', 'dispatch', 'completed'].includes(order.status) },
      { step: 4, name: 'Laser Cutting', completed: ['laser_cutting', 'metal_bending', 'fabrication_welding', 'finishing', 'powder_coating', 'assembling', 'quality_check', 'dispatch', 'completed'].includes(order.status) },
      { step: 5, name: 'Metal Bending', completed: ['metal_bending', 'fabrication_welding', 'finishing', 'powder_coating', 'assembling', 'quality_check', 'dispatch', 'completed'].includes(order.status) },
      { step: 6, name: 'Fabrication (Welding)', completed: ['fabrication_welding', 'finishing', 'powder_coating', 'assembling', 'quality_check', 'dispatch', 'completed'].includes(order.status) },
      { step: 7, name: 'Finishing', completed: ['finishing', 'powder_coating', 'assembling', 'quality_check', 'dispatch', 'completed'].includes(order.status) },
      { step: 8, name: 'Powder Coating', completed: ['powder_coating', 'assembling', 'quality_check', 'dispatch', 'completed'].includes(order.status) },
      { step: 9, name: 'Assembling', completed: ['assembling', 'quality_check', 'dispatch', 'completed'].includes(order.status) },
      { step: 10, name: 'Quality Check', completed: ['quality_check', 'dispatch', 'completed'].includes(order.status) },
      { step: 11, name: 'Dispatch', completed: ['dispatch', 'completed'].includes(order.status) },
    ];
    
    // Determine current step
    let currentStep = 1;
    if (order.status === 'approved') currentStep = 2;
    else if (order.status === 'designing') currentStep = 3;
    else if (order.status === 'laser_cutting') currentStep = 4;
    else if (order.status === 'metal_bending') currentStep = 5;
    else if (order.status === 'fabrication_welding') currentStep = 6;
    else if (order.status === 'finishing') currentStep = 7;
    else if (order.status === 'powder_coating') currentStep = 8;
    else if (order.status === 'assembling') currentStep = 9;
    else if (order.status === 'quality_check') currentStep = 10;
    else if (['dispatch', 'completed'].includes(order.status)) currentStep = 11;
    
    res.status(200).json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        productType: order.productType,
        metalType: order.metalType,
        thickness: order.thickness,
        width: order.width,
        height: order.height,
        quantity: order.quantity,
        color: order.color,
        additionalRequirements: order.additionalRequirements,
        designFile: order.designFile,
        testReport: order.testReport,
        invoice: order.invoice,
        expectedDeliveryDate: order.expectedDeliveryDate,
        cancelledAt: order.cancelledAt,
        cancellationReason: order.cancellationReason,
        messages: formattedMessages,
        progress: {
          currentStep,
          steps: progressSteps,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/v1/orders
// @desc    Place a new order
// @access  Private
router.post('/', protect, upload.single('designFile'), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("File received:", req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : "No file");
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a design file',
      });
    }
    
    // Extract form data
    const {
      productType,
      metalType,
      thickness,
      width,
      height,
      quantity,
      color,
      additionalRequirements,
    } = req.body;
    
    // Check for required fields
    const requiredFields = {
      productType,
      metalType,
      thickness,
      width,
      height,
      quantity,
      color
    };
    
    const missingFields = [];
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.toString().trim() === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }
    
    // Store file metadata (not actual file)
    const fileDetails = {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      uploadDate: new Date()
    };
    
    // Create new order with validated data
    const order = await Order.create({
      customerId: req.user._id,
      productType,
      metalType,
      thickness: parseFloat(thickness),
      width: parseFloat(width),
      height: parseFloat(height),
      quantity: parseInt(quantity),
      color,
      additionalRequirements: additionalRequirements || '',
      // Store serialized file info instead of a real path
      designFile: `memory-storage://${fileDetails.name}`,
    });
    
    // Create a welcome message from system
    try {
      // Find an admin user to use as sender
      const adminUser = await User.findOne({ role: 'admin' });
      
      if (adminUser) {
        await Message.create({
          orderId: order._id,
          senderId: adminUser._id, // Use admin ID instead of customer ID
          content: 'Thank you for your order. We are currently reviewing your specifications and will update you soon.',
        });
      } else {
        // Fallback: create message with system flag
        await Message.create({
          orderId: order._id,
          senderId: req.user._id,
          content: 'Thank you for your order. We are currently reviewing your specifications and will update you soon.',
          isSystemMessage: true, // Add system flag
        });
      }
    } catch (messageError) {
      console.error('Error creating welcome message:', messageError);
      // Don't fail order creation if message creation fails
    }
    
    // Create notifications for all admin users
    try {
      const adminUsers = await User.find({ role: 'admin' });
      
      const adminNotifications = adminUsers.map(admin => ({
        userId: admin._id,
        title: 'New Order Received',
        message: `A new order ${order.orderNumber} has been placed by ${req.user.name} from ${req.user.company}`,
        type: 'order_status',
        orderId: order._id,
      }));
      
      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
        console.log(`Created ${adminNotifications.length} admin notifications for new order ${order.orderNumber}`);
      }
      
      // Send notifications (both email and WhatsApp)
      const adminEmails = adminUsers.map(admin => admin.email);
      
      // Add client email if specified
      if (process.env.CLIENT_EMAIL) {
        adminEmails.push(process.env.CLIENT_EMAIL);
      }
      
      // Prepare order data for notifications
      const orderData = {
        orderNumber: order.orderNumber,
        productType: order.productType,
        metalType: order.metalType,
        thickness: order.thickness,
        width: order.width,
        height: order.height,
        quantity: order.quantity,
        color: order.color,
        additionalRequirements: order.additionalRequirements,
        status: order.status
      };
      
      const customerData = {
        name: req.user.name,
        email: req.user.email,
        company: req.user.company,
        phone: req.user.phone
      };
      
      notificationService.sendNewOrderNotification(orderData, customerData, adminEmails)
        .then(results => {
          console.log('New order notifications sent successfully:', results);
        })
        .catch(error => {
          console.error('Error sending new order notifications:', error);
        });
        
    } catch (notificationError) {
      console.error('Error creating admin notifications:', notificationError);
      // Don't fail the order creation if notification fails
    }
    
    res.status(201).json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create order',
    });
  }
});

// @route   POST /api/v1/orders/:id/messages
// @desc    Send a message about a specific order
// @access  Private
router.post('/:id/messages', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Check if order exists
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    
    // Check if customer owns the order
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order',
      });
    }
    
    // Create message
    const message = await Message.create({
      orderId: order._id,
      senderId: req.user._id,
      content,
    });
    
    // Create notifications for all admin users
    try {
      const adminUsers = await User.find({ role: 'admin' });
      
      const adminNotifications = adminUsers.map(admin => ({
        userId: admin._id,
        title: 'New Customer Message',
        message: `${req.user.name} sent a message regarding order #${order.orderNumber}`,
        type: 'message',
        orderId: order._id,
      }));
      
      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
        console.log(`Created ${adminNotifications.length} admin notifications for customer message on order ${order.orderNumber}`);
      }
      
      // Send email notifications to admins
      const adminEmails = adminUsers.map(admin => admin.email);
      if (process.env.CLIENT_EMAIL) {
        adminEmails.push(process.env.CLIENT_EMAIL);
      }
      
      const orderData = {
        orderNumber: order.orderNumber,
        productType: order.productType,
        metalType: order.metalType
      };
      
      const senderData = {
        name: req.user.name,
        email: req.user.email,
        company: req.user.company,
        phone: req.user.phone
      };
      
      // Send notification to admins about customer message
      notificationService.sendNewMessageNotification(
        orderData, 
        senderData, 
        content, 
        adminEmails, 
        false // isAdminSender = false (customer is sender)
      ).then(results => {
        console.log('Customer message notifications sent to admins:', results);
      }).catch(error => {
        console.error('Error sending customer message notifications to admins:', error);
      });
      
    } catch (notificationError) {
      console.error('Error creating admin notifications:', notificationError);
      // Don't fail the message creation if notification fails
    }
    
    res.status(201).json({
      success: true,
      message: {
        id: message._id,
        content: message.content,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/v1/orders/:id/cancel
// @desc    Cancel an order (customer only, before design phase)
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    
    // Find the order
    const order = await Order.findById(req.params.id).populate('customerId', 'name email company phone');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    
    // Check if customer owns the order
    if (order.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }
    
    // Check if order can be cancelled (frontend logic duplicated for security)
    const cancellableStatuses = ['pending', 'approved', 'designing'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage. Please contact support for assistance.',
      });
    }
    
    // Cancel the order
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by customer';
    order.updatedAt = Date.now();
    await order.save();
    
    // Create a message about the cancellation
    await Message.create({
      orderId: order._id,
      senderId: req.user._id,
      content: `Order has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
    });
    
    // Create notifications for all admin users
    try {
      const adminUsers = await User.find({ role: 'admin' });
      
      const adminNotifications = adminUsers.map(admin => ({
        userId: admin._id,
        title: 'Order Cancelled',
        message: `Order ${order.orderNumber} has been cancelled by ${req.user.name}`,
        type: 'order_status',
        orderId: order._id,
      }));
      
      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
        console.log(`Created ${adminNotifications.length} admin notifications for cancelled order ${order.orderNumber}`);
      }
      
      // Send cancellation notifications (both email and WhatsApp)
      const adminEmails = adminUsers.map(admin => admin.email);
      if (process.env.CLIENT_EMAIL) {
        adminEmails.push(process.env.CLIENT_EMAIL);
      }
      
      const orderData = {
        orderNumber: order.orderNumber,
        status: order.status,
        productType: order.productType,
        metalType: order.metalType,
        thickness: order.thickness,
        width: order.width,
        height: order.height,
        quantity: order.quantity,
        color: order.color,
        additionalRequirements: order.additionalRequirements
      };
      
      const customerData = {
        name: order.customerId.name,
        email: order.customerId.email,
        company: order.customerId.company,
        phone: order.customerId.phone
      };
      
      // Send cancellation notifications
      notificationService.sendOrderCancellationNotification(
        orderData, 
        customerData, 
        reason || 'No reason provided', 
        adminEmails
      ).then(results => {
        console.log('Order cancellation notifications sent successfully:', results);
      }).catch(error => {
        console.error('Error sending order cancellation notifications:', error);
      });
      
    } catch (notificationError) {
      console.error('Error creating cancellation notifications:', notificationError);
      // Don't fail the cancellation if notification fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        cancelledAt: order.cancelledAt,
        cancellationReason: order.cancellationReason,
      },
    });
  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel order',
    });
  }
});

// @route   GET /api/v1/orders/:id/documents/:documentType
// @desc    Download document for a specific order
// @access  Private
router.get('/:id/documents/:documentType', protect, async (req, res) => {
  try {
    const { id, documentType } = req.params;
    
    // Check if order exists
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    
    // Check if customer owns the order
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order',
      });
    }
    
    // Get document URL based on type
    let documentUrl;
    if (documentType === 'design') {
      documentUrl = order.designFile;
    } else if (documentType === 'test-report') {
      documentUrl = order.testReport;
    } else if (documentType === 'invoice') {
      documentUrl = order.invoice;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type',
      });
    }
    
    if (!documentUrl) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check if this is a virtual memory-storage file
    if (documentUrl.startsWith('memory-storage://')) {
      // Generate dummy PDF content
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${documentType}-${order.orderNumber}.pdf`);
      
      // Send a dummy PDF message
      res.send(Buffer.from(`This is a placeholder for ${documentType}. In production, this would be stored in a proper storage service.`));
      return;
    }
    
    // For local file system:
    // Extract the file path from the URL
    // URL format: http://host/uploads/userId/filename.pdf
    const urlParts = documentUrl.split('/uploads/');
    if (urlParts.length < 2) {
      return res.status(404).json({
        success: false,
        message: 'Document path invalid',
      });
    }
    
    const relativePath = urlParts[1]; // userId/filename.pdf
    const filePath = path.join(__dirname, '../uploads', relativePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found',
      });
    }
    
    // Set the appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${documentType}-${order.orderNumber}.pdf`);
    
    // Send the file
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;