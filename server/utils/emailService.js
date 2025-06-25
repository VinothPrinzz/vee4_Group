// server/utils/emailService.js
const nodemailer = require('nodemailer');
const whatsappService = require('./whatsappService');

// Create transporter with Gmail (you can change this to your preferred email service)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS  // Your app password
    }
  });
};

// Email templates (keeping existing ones)
const emailTemplates = {
  newOrder: (orderData, customerData) => ({
    subject: `New Order Received - ${orderData.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">New Order Received!</h1>
        </div>
        
        <div style="padding: 20px; background: #f8fafc;">
          <h2 style="color: #1e293b;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #e2e8f0;">
              <td style="padding: 12px; font-weight: bold;">Order Number</td>
              <td style="padding: 12px;">${orderData.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold;">Product Type</td>
              <td style="padding: 12px;">${orderData.productType}</td>
            </tr>
            <tr style="background: #e2e8f0;">
              <td style="padding: 12px; font-weight: bold;">Metal Type</td>
              <td style="padding: 12px;">${orderData.metalType}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold;">Dimensions</td>
              <td style="padding: 12px;">${orderData.width}mm × ${orderData.height}mm × ${orderData.thickness}mm</td>
            </tr>
            <tr style="background: #e2e8f0;">
              <td style="padding: 12px; font-weight: bold;">Quantity</td>
              <td style="padding: 12px;">${orderData.quantity} units</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold;">Color</td>
              <td style="padding: 12px;">${orderData.color}</td>
            </tr>
          </table>
          
          <h3 style="color: #1e293b;">Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #e2e8f0;">
              <td style="padding: 12px; font-weight: bold;">Customer Name</td>
              <td style="padding: 12px;">${customerData.name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold;">Company</td>
              <td style="padding: 12px;">${customerData.company}</td>
            </tr>
            <tr style="background: #e2e8f0;">
              <td style="padding: 12px; font-weight: bold;">Email</td>
              <td style="padding: 12px;">${customerData.email}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold;">Phone</td>
              <td style="padding: 12px;">${customerData.phone}</td>
            </tr>
          </table>
          
          ${orderData.additionalRequirements ? `
            <h3 style="color: #1e293b;">Additional Requirements</h3>
            <p style="background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 10px 0;">
              ${orderData.additionalRequirements}
            </p>
          ` : ''}
        </div>
        
        <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Please review this order in your admin dashboard.</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">© 2025 Vee4 Group</p>
        </div>
      </div>
    `
  }),

  orderStatusUpdate: (orderData, customerData, statusMessage, expectedDeliveryDate) => ({
    subject: `Order Status Update - ${orderData.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Order Status Updated</h1>
        </div>
        
        <div style="padding: 20px; background: #f8fafc;">
          <h2 style="color: #1e293b;">Dear ${customerData.name},</h2>
          <p style="font-size: 16px; line-height: 1.6;">
            Your order <strong>${orderData.orderNumber}</strong> status has been updated to:
          </p>
          
          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0; color: #0369a1; text-transform: capitalize;">
              ${orderData.status.replace('_', ' ')}
            </h3>
          </div>
          
          ${expectedDeliveryDate ? `
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
              <h2 style="margin: 0 0 10px 0; font-size: 24px;">🚚 Expected Delivery Date</h2>
              <div style="background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 8px; margin-top: 15px;">
                <p style="margin: 0; font-size: 28px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                  ${new Date(expectedDeliveryDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">
                  Mark your calendar! 📅
                </p>
              </div>
            </div>
          ` : ''}
          
          ${statusMessage ? `
            <div style="background: white; border: 1px solid #e2e8f0; padding: 15px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #1e293b;">Message from Vee4 Team:</h4>
              <p style="margin: 0; line-height: 1.6;">${statusMessage}</p>
            </div>
          ` : ''}
          
          <p style="margin-top: 30px;">
            You can track your order progress by logging into your account.
          </p>
        </div>
        
        <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Thank you for choosing Vee4 Group!</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">© 2025 Vee4 Group</p>
        </div>
      </div>
    `
  }),

  newMessage: (orderData, senderData, messageContent, isAdminSender) => ({
    subject: `New Message - Order ${orderData.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">New Message Received</h1>
        </div>
        
        <div style="padding: 20px; background: #f8fafc;">
          <h2 style="color: #1e293b;">
            ${isAdminSender ? `Message from Vee4 Team` : `Message from ${senderData.name}`}
          </h2>
          
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">Regarding Order: ${orderData.orderNumber}</h4>
          </div>
          
          <div style="background: white; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h4 style="margin: 0 0 15px 0; color: #1e293b;">Message:</h4>
            <p style="margin: 0; line-height: 1.6; font-size: 16px;">${messageContent}</p>
          </div>
          
          ${!isAdminSender ? `
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;">
                <strong>From:</strong> ${senderData.name} (${senderData.company})<br>
                <strong>Email:</strong> ${senderData.email}
              </p>
            </div>
          ` : ''}
          
          <p style="margin-top: 30px;">
            Please log into your dashboard to view the complete conversation and respond.
          </p>
        </div>
        
        <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Vee4 Group - Custom Metal Solutions</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">© 2025 Vee4 Group</p>
        </div>
      </div>
    `
  }),

  documentUploaded: (orderData, customerData, documentType) => ({
    subject: `New Document Available - Order ${orderData.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">New Document Available</h1>
        </div>
        
        <div style="padding: 20px; background: #f8fafc;">
          <h2 style="color: #1e293b;">Dear ${customerData.name},</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            A new <strong>${documentType === 'test-report' ? 'test report' : 'invoice'}</strong> 
            is now available for your order <strong>${orderData.orderNumber}</strong>.
          </p>
          
          <div style="background: #f3e8ff; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0; color: #6b21a8;">
              ${documentType === 'test-report' ? '📋 Quality Test Report' : '📄 Invoice Document'}
            </h4>
            <p style="margin: 5px 0 0 0;">Ready for download in your dashboard</p>
          </div>
          
          <p style="margin-top: 30px;">
            Please log into your account to download the document.
          </p>
        </div>
        
        <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Thank you for choosing Vee4 Group!</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">© 2025 Vee4 Group</p>
        </div>
      </div>
    `
  }),

  orderCancellation: (orderData, customerData, reason) => ({
    subject: `Order Cancellation Confirmation - ${orderData.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Order Cancellation Confirmed</h1>
        </div>
        
        <div style="padding: 20px; background: #f8fafc;">
          <h2 style="color: #1e293b;">Dear ${customerData.name},</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Your order <strong>${orderData.orderNumber}</strong> has been successfully cancelled as requested.
          </p>
          
          ${reason ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #92400e;">Cancellation Reason:</h4>
              <p style="margin: 0;">${reason}</p>
            </div>
          ` : ''}
          
          <div style="background: white; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h4 style="margin: 0 0 15px 0; color: #1e293b;">Cancelled Order Details:</h4>
            <p style="margin: 5px 0;"><strong>Product:</strong> ${orderData.productType}</p>
            <p style="margin: 5px 0;"><strong>Material:</strong> ${orderData.metalType}</p>
            <p style="margin: 5px 0;"><strong>Quantity:</strong> ${orderData.quantity} units</p>
            <p style="margin: 5px 0;"><strong>Dimensions:</strong> ${orderData.width}mm × ${orderData.height}mm × ${orderData.thickness}mm</p>
          </div>
          
          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #0369a1;">Refund Information</h4>
            <p style="margin: 0;">If payment was made, refund will be processed within 3-5 business days. You will receive a separate confirmation for any refunds.</p>
          </div>
          
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #15803d;">Place New Order</h4>
            <p style="margin: 0;">You can place a new order anytime through your dashboard. Contact us if you need help with design modifications.</p>
          </div>
          
          <p style="margin-top: 30px;">
            If you have any questions about this cancellation, please don't hesitate to contact our support team.
          </p>
        </div>
        
        <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Thank you for your understanding!</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">© 2025 Vee4 Group</p>
        </div>
      </div>
    `
  })
};

// Main email + WhatsApp service
const notificationService = {
  // Send email to single recipient
  async sendEmail(to, subject, html) {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `"Vee4 Group" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html
      };
      
      const result = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}:`, result.messageId);
      return result;
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw error;
    }
  },

  // Send email to multiple recipients
  async sendBulkEmail(recipients, subject, html) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail(recipient, subject, html);
        results.push({ email: recipient, success: true, messageId: result.messageId });
      } catch (error) {
        results.push({ email: recipient, success: false, error: error.message });
      }
    }
    
    return results;
  },

  // Combined notification function that sends both email and WhatsApp
  async sendCombinedNotification(emailRecipients, whatsappRecipients, emailSubject, emailHtml, whatsappSubject, whatsappMessage) {
    const results = {
      email: { success: [], failed: [] },
      whatsapp: { success: [], failed: [] }
    };

    // Send emails
    try {
      const emailResults = await this.sendBulkEmail(emailRecipients, emailSubject, emailHtml);
      emailResults.forEach(result => {
        if (result.success) {
          results.email.success.push(result);
        } else {
          results.email.failed.push(result);
        }
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      results.email.failed.push({ error: error.message });
    }

    // Send WhatsApp messages
    try {
      const whatsappResults = await whatsappService.sendBulkWhatsApp(whatsappRecipients, whatsappSubject, whatsappMessage);
      whatsappResults.forEach(result => {
        if (result.success) {
          results.whatsapp.success.push(result);
        } else {
          results.whatsapp.failed.push(result);
        }
      });
    } catch (error) {
      console.error('WhatsApp sending failed:', error);
      results.whatsapp.failed.push({ error: error.message });
    }

    return results;
  },

  // Enhanced notification functions with both email and WhatsApp
  async sendNewOrderNotification(orderData, customerData, adminEmails) {
    const { subject, html } = emailTemplates.newOrder(orderData, customerData);
    
    // Prepare WhatsApp recipients
    const adminUsers = []; // This should be populated with admin user objects
    
    try {
      // Get admin user objects for WhatsApp (you'll need to pass this or fetch it)
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' });
      adminUsers.push(...admins);
    } catch (error) {
      console.error('Error fetching admin users for WhatsApp:', error);
    }

    // Send to customer
    const customerEmailResult = await this.sendEmail(customerData.email, 
      `Order Confirmation - ${orderData.orderNumber}`, html);
    
    const customerWhatsAppResult = await whatsappService.sendNewOrderNotification(
      orderData, customerData, adminUsers
    );

    // Send to admins
    const adminEmailResults = await this.sendBulkEmail(adminEmails, subject, html);

    return { 
      customerEmail: customerEmailResult, 
      customerWhatsApp: customerWhatsAppResult.customerResult,
      adminEmails: adminEmailResults,
      adminWhatsApp: customerWhatsAppResult.adminResults
    };
  },

  async sendOrderStatusUpdate(orderData, customerData, statusMessage, expectedDeliveryDate, adminEmails) {
    const { subject, html } = emailTemplates.orderStatusUpdate(orderData, customerData, statusMessage, expectedDeliveryDate);
    
    // Get admin users for WhatsApp
    let adminUsers = [];
    try {
      const User = require('../models/User');
      adminUsers = await User.find({ role: 'admin' });
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }

    // Send to customer
    const customerEmailResult = await this.sendEmail(customerData.email, subject, html);
    
    const whatsappResults = await whatsappService.sendOrderStatusUpdate(
      orderData, customerData, statusMessage, expectedDeliveryDate, adminUsers
    );

    // Send notification to admins (modified subject for admins)
    const adminSubject = `Order Status Updated by Admin - ${orderData.orderNumber}`;
    const adminEmailResults = await this.sendBulkEmail(adminEmails, adminSubject, html);

    return { 
      customerEmail: customerEmailResult,
      customerWhatsApp: whatsappResults.customerResult,
      adminEmails: adminEmailResults,
      adminWhatsApp: whatsappResults.adminResults
    };
  },

  async sendNewMessageNotification(orderData, senderData, messageContent, recipientEmails, isAdminSender = false) {
    const { subject, html } = emailTemplates.newMessage(orderData, senderData, messageContent, isAdminSender);
    
    // Extract phone numbers from recipient emails (you might need to adjust this logic)
    let recipientPhones = [];
    
    if (isAdminSender) {
      // Message from admin to customer - get customer's phone
      recipientPhones = [orderData.customerPhone]; // You'll need to pass this
    } else {
      // Message from customer to admins - get admin phones
      try {
        const User = require('../models/User');
        const admins = await User.find({ role: 'admin' });
        recipientPhones = admins.map(admin => admin.phone).filter(phone => phone);
        
        if (process.env.CLIENT_WHATSAPP_PHONE) {
          recipientPhones.push(process.env.CLIENT_WHATSAPP_PHONE);
        }
      } catch (error) {
        console.error('Error fetching admin phones:', error);
      }
    }

    const emailResults = await this.sendBulkEmail(recipientEmails, subject, html);
    
    const whatsappResults = await whatsappService.sendNewMessageNotification(
      orderData, senderData, messageContent, recipientPhones, isAdminSender
    );

    return { emailResults, whatsappResults };
  },

  async sendDocumentUploadNotification(orderData, customerData, documentType, adminEmails) {
    const { subject, html } = emailTemplates.documentUploaded(orderData, customerData, documentType);
    
    console.log('Sending document upload notifications...');
    
    // Get admin users for WhatsApp
    let adminUsers = [];
    try {
      const User = require('../models/User');
      adminUsers = await User.find({ role: 'admin' });
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }

    // Send to customer
    const customerEmailResult = await this.sendEmail(customerData.email, subject, html);
    console.log('Customer email result:', customerEmailResult.messageId);
    
    // Send WhatsApp notifications
    const whatsappResults = await whatsappService.sendDocumentUploadNotification(
      orderData, customerData, documentType, adminUsers
    );

    // Send notification to admins
    const adminSubject = `Document Uploaded - ${documentType === 'test-report' ? 'Test Report' : 'Invoice'} for Order ${orderData.orderNumber}`;
    const adminEmailResults = await this.sendBulkEmail(adminEmails, adminSubject, html);
    console.log('Admin email results count:', adminEmailResults.length);

    return { 
      customerEmail: customerEmailResult,
      customerWhatsApp: whatsappResults.customerResult,
      adminEmails: adminEmailResults,
      adminWhatsApp: whatsappResults.adminResults
    };
  },

  // New methods for order approval and rejection
  async sendOrderApprovalNotification(orderData, customerData, message, expectedDeliveryDate, adminEmails) {
    const { subject, html } = emailTemplates.orderStatusUpdate(orderData, customerData, message, expectedDeliveryDate);
    
    // Get admin users for WhatsApp
    let adminUsers = [];
    try {
      const User = require('../models/User');
      adminUsers = await User.find({ role: 'admin' });
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }

    // Send to customer
    const customerEmailResult = await this.sendEmail(customerData.email, subject, html);
    
    // Send WhatsApp notifications
    const whatsappResults = await whatsappService.sendOrderApprovalNotification(
      orderData, customerData, message, expectedDeliveryDate, adminUsers
    );

    // Send notification to admins
    const adminSubject = `Order Approved - ${orderData.orderNumber}`;
    const adminEmailResults = await this.sendBulkEmail(adminEmails, adminSubject, html);

    return { 
      customerEmail: customerEmailResult,
      customerWhatsApp: whatsappResults.customerResult,
      adminEmails: adminEmailResults,
      adminWhatsApp: whatsappResults.adminResults
    };
  },

  async sendOrderRejectionNotification(orderData, customerData, message, adminEmails) {
    const { subject, html } = emailTemplates.orderStatusUpdate(orderData, customerData, message, null);
    
    // Get admin users for WhatsApp
    let adminUsers = [];
    try {
      const User = require('../models/User');
      adminUsers = await User.find({ role: 'admin' });
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }

    // Send to customer
    const customerEmailResult = await this.sendEmail(customerData.email, subject, html);
    
    // Send WhatsApp notifications
    const whatsappResults = await whatsappService.sendOrderRejectionNotification(
      orderData, customerData, message, adminUsers
    );

    // Send notification to admins
    const adminSubject = `Order Rejected - ${orderData.orderNumber}`;
    const adminEmailResults = await this.sendBulkEmail(adminEmails, adminSubject, html);

    return { 
      customerEmail: customerEmailResult,
      customerWhatsApp: whatsappResults.customerResult,
      adminEmails: adminEmailResults,
      adminWhatsApp: whatsappResults.adminResults
    };
  },

  async sendOrderCancellationNotification(orderData, customerData, reason, adminEmails) {
    const { subject, html } = emailTemplates.orderCancellation(orderData, customerData, reason);
    
    // Get admin users for WhatsApp
    let adminUsers = [];
    try {
      const User = require('../models/User');
      adminUsers = await User.find({ role: 'admin' });
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }

    // Send to customer
    const customerEmailResult = await this.sendEmail(customerData.email, subject, html);
    
    // Send WhatsApp notifications
    const whatsappResults = await whatsappService.sendOrderCancellationNotification(
      orderData, customerData, reason, adminUsers
    );

    // Send notification to admins
    const adminSubject = `Order Cancelled by Customer - ${orderData.orderNumber}`;
    const adminEmailResults = await this.sendBulkEmail(adminEmails, adminSubject, html);

    return { 
      customerEmail: customerEmailResult,
      customerWhatsApp: whatsappResults.customerResult,
      adminEmails: adminEmailResults,
      adminWhatsApp: whatsappResults.adminResults
    };
  }
};

module.exports = notificationService;