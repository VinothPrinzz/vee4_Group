// server/utils/whatsappService.js
const twilio = require('twilio');

// Initialize Twilio client
const createTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.warn('Twilio credentials not configured. WhatsApp notifications disabled.');
    return null;
  }
  
  return twilio(accountSid, authToken);
};

// WhatsApp message templates
const whatsappTemplates = {
  newOrder: (orderData, customerData) => ({
    subject: `🔔 New Order Alert - ${orderData.orderNumber}`,
    message: `🆕 *NEW ORDER RECEIVED*\n\n` +
             `📋 *Order Details:*\n` +
             `• Order ID: ${orderData.orderNumber}\n` +
             `• Product: ${orderData.productType}\n` +
             `• Material: ${orderData.metalType}\n` +
             `• Thickness: ${orderData.thickness}mm\n` +
             `• Quantity: ${orderData.quantity} units\n` +
             `• Color: ${orderData.color}\n\n` +
             `👤 *Customer Info:*\n` +
             `• Name: ${customerData.name}\n` +
             `• Company: ${customerData.company}\n` +
             `• Email: ${customerData.email}\n` +
             `• Phone: ${customerData.phone}\n\n` +
             `${orderData.additionalRequirements ? `📝 *Special Requirements:*\n${orderData.additionalRequirements}\n\n` : ''}` +
             `⚡ Please review this order in your admin dashboard.\n\n` +
             `🏭 *Vee4 Group - Custom Metal Solutions*`
  }),

  orderStatusUpdate: (orderData, customerData, statusMessage, expectedDeliveryDate) => {
    const statusEmojis = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌',
      designing: '🎨',
      laser_cutting: '⚡',
      metal_bending: '🔧',
      fabrication_welding: '🔥',
      finishing: '✨',
      powder_coating: '🎭',
      assembling: '🔩',
      quality_check: '🔍',
      dispatch: '🚚',
      completed: '🎉'
    };
    
    const emoji = statusEmojis[orderData.status] || '📋';
    const statusText = orderData.status.replace('_', ' ').toUpperCase();
    
    let message = `${emoji} *ORDER STATUS UPDATED*\n\n` +
                  `👋 Hi ${customerData.name}!\n\n` +
                  `📋 Your order *${orderData.orderNumber}* status has been updated to:\n` +
                  `🔄 *${statusText}*\n\n`;
    
    if (expectedDeliveryDate) {
      const formattedDate = new Date(expectedDeliveryDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      message += `🗓️ *Expected Delivery:*\n📅 ${formattedDate}\n\n`;
      
      const daysLeft = Math.ceil((new Date(expectedDeliveryDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft > 0) {
        message += `⏰ *${daysLeft} days remaining*\n\n`;
      }
    }
    
    if (statusMessage) {
      message += `💬 *Message from Vee4 Team:*\n"${statusMessage}"\n\n`;
    }
    
    message += `🏭 Thank you for choosing Vee4 Group!\n` +
               `📱 Track your order progress anytime.`;
    
    return { subject: `Order Update - ${orderData.orderNumber}`, message };
  },

  newMessage: (orderData, senderData, messageContent, isAdminSender) => ({
    subject: `💬 New Message - Order ${orderData.orderNumber}`,
    message: `💬 *NEW MESSAGE RECEIVED*\n\n` +
             `${isAdminSender ? '🏭 *From: Vee4 Team*' : `👤 *From: ${senderData.name}*`}\n` +
             `📋 *Order: ${orderData.orderNumber}*\n\n` +
             `💭 *Message:*\n"${messageContent}"\n\n` +
             `${!isAdminSender ? 
               `📞 *Sender Details:*\n` +
               `• Name: ${senderData.name}\n` +
               `• Company: ${senderData.company}\n` +
               `• Email: ${senderData.email}\n\n` : ''
             }` +
             `📱 Please check your dashboard for complete conversation.\n\n` +
             `🏭 *Vee4 Group - Custom Metal Solutions*`
  }),

  documentUploaded: (orderData, customerData, documentType) => {
    const docEmojis = {
      'test-report': '📋',
      'invoice': '🧾'
    };
    
    const emoji = docEmojis[documentType] || '📄';
    const docName = documentType === 'test-report' ? 'Test Report' : 'Invoice';
    
    return {
      subject: `${emoji} New Document - ${docName}`,
      message: `${emoji} *NEW DOCUMENT AVAILABLE*\n\n` +
               `👋 Hi ${customerData.name}!\n\n` +
               `📄 A new *${docName}* is now available for your order:\n` +
               `📋 *${orderData.orderNumber}*\n\n` +
               `${documentType === 'test-report' ? 
                 '🔍 *Quality Test Report Ready*\nYour product has passed our quality checks!' : 
                 '💰 *Invoice Generated*\nYour order invoice is ready for download.'}\n\n` +
               `📱 Please log into your account to download the document.\n\n` +
               `🏭 *Vee4 Group - Custom Metal Solutions*`
    };
  },

  orderApproval: (orderData, customerData, message, expectedDeliveryDate) => {
    const formattedDate = expectedDeliveryDate ? 
      new Date(expectedDeliveryDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '';
    
    return {
      subject: `✅ Order Approved - ${orderData.orderNumber}`,
      message: `✅ *ORDER APPROVED!*\n\n` +
               `🎉 Great news ${customerData.name}!\n\n` +
               `Your order *${orderData.orderNumber}* has been approved and will move to production shortly.\n\n` +
               `${expectedDeliveryDate ? 
                 `📅 *Expected Delivery Date:*\n🗓️ ${formattedDate}\n\n` : ''
               }` +
               `${message ? `💬 *Message from Vee4 Team:*\n"${message}"\n\n` : ''}` +
               `🔄 *Next Steps:*\n` +
               `• Material preparation will begin\n` +
               `• You'll receive updates at each stage\n` +
               `• Quality checks before delivery\n\n` +
               `📱 Track your order progress in your dashboard.\n\n` +
               `🏭 *Vee4 Group - Custom Metal Solutions*`
    };
  },

  orderRejection: (orderData, customerData, message) => ({
    subject: `❌ Order Update - ${orderData.orderNumber}`,
    message: `❌ *ORDER STATUS UPDATE*\n\n` +
             `Hi ${customerData.name},\n\n` +
             `We regret to inform you that order *${orderData.orderNumber}* has been rejected.\n\n` +
             `${message ? `💬 *Reason:*\n"${message}"\n\n` : ''}` +
             `📞 *Next Steps:*\n` +
             `• Please contact our team for clarification\n` +
             `• We're here to help with alternative solutions\n` +
             `• You can submit a new order with modifications\n\n` +
             `📧 Email: info@vee4group.com\n` +
             `📱 Phone: ${customerData.phone}\n\n` +
             `🏭 *Vee4 Group - We're here to help!*`
  }),

  orderCancellation: (orderData, customerData, reason) => ({
    subject: `🔄 Order Cancelled - ${orderData.orderNumber}`,
    message: `🔄 *ORDER CANCELLATION CONFIRMED*\n\n` +
             `Hi ${customerData.name},\n\n` +
             `Your order *${orderData.orderNumber}* has been successfully cancelled.\n\n` +
             `${reason ? `💭 *Cancellation Reason:*\n"${reason}"\n\n` : ''}` +
             `📋 *Order Details:*\n` +
             `• Product: ${orderData.productType}\n` +
             `• Material: ${orderData.metalType}\n` +
             `• Quantity: ${orderData.quantity} units\n\n` +
             `💰 *Refund Information:*\n` +
             `• If payment was made, refund will be processed within 3-5 business days\n` +
             `• You will receive a separate confirmation for any refunds\n\n` +
             `🆕 *Place New Order:*\n` +
             `• You can place a new order anytime\n` +
             `• Contact us for design modifications\n` +
             `• We're here to help with your requirements\n\n` +
             `📞 *Contact Support:*\n` +
             `📧 Email: info@vee4group.com\n` +
             `📱 Phone: ${customerData.phone}\n\n` +
             `🏭 *Vee4 Group - Thank you for your understanding*`
  })
};

// Main WhatsApp service
const whatsappService = {
  // Send WhatsApp message to single recipient
  async sendWhatsApp(to, subject, message) {
    try {
      const client = createTwilioClient();
      
      if (!client) {
        console.log('WhatsApp service not configured, skipping message');
        return { success: false, error: 'Service not configured' };
      }
      
      // Ensure phone number is in correct format
      const formattedNumber = this.formatPhoneNumber(to);
      
      if (!formattedNumber) {
        throw new Error(`Invalid phone number format: ${to}`);
      }
      
      const result = await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, // Your Twilio WhatsApp number
        to: `whatsapp:${formattedNumber}`,
        body: message
      });
      
      console.log(`WhatsApp sent successfully to ${formattedNumber}:`, result.sid);
      return { success: true, messageSid: result.sid };
    } catch (error) {
      console.error(`Error sending WhatsApp to ${to}:`, error);
      return { success: false, error: error.message };
    }
  },

  // Send WhatsApp to multiple recipients
  async sendBulkWhatsApp(recipients, subject, message) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendWhatsApp(recipient, subject, message);
        results.push({ phone: recipient, ...result });
      } catch (error) {
        results.push({ phone: recipient, success: false, error: error.message });
      }
    }
    
    return results;
  },

  // Format phone number for WhatsApp
  formatPhoneNumber(phone) {
    if (!phone) return null;
    
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('0')) {
      // Indian number starting with 0, assume it needs +91
      cleaned = '91' + cleaned.substring(1);
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      // Already has country code 91
      cleaned = cleaned;
    } else if (cleaned.length === 10) {
      // 10 digit number, assume Indian
      cleaned = '91' + cleaned;
    } else if (cleaned.startsWith('1') && cleaned.length === 11) {
      // US/Canada number
      cleaned = cleaned;
    } else if (!cleaned.startsWith('+')) {
      // Add default country code if none detected (customize based on your region)
      cleaned = '91' + cleaned; // Default to India
    }
    
    return '+' + cleaned;
  },

  // Extract phone numbers from user data and admin settings
  getPhoneNumbers(users) {
    return users
      .map(user => user.phone)
      .filter(phone => phone)
      .map(phone => this.formatPhoneNumber(phone))
      .filter(phone => phone);
  },

  // Specific WhatsApp functions for each notification type
  async sendNewOrderNotification(orderData, customerData, adminUsers) {
    const { subject, message } = whatsappTemplates.newOrder(orderData, customerData);
    
    // Send to customer (confirmation)
    const customerResult = await this.sendWhatsApp(
      customerData.phone, 
      `Order Confirmation - ${orderData.orderNumber}`, 
      message.replace('🆕 *NEW ORDER RECEIVED*', '✅ *ORDER CONFIRMATION*')
    );
    
    // Send to admins (notification)
    const adminPhones = this.getPhoneNumbers(adminUsers);
    
    // Add client phone if specified
    if (process.env.CLIENT_WHATSAPP_PHONE) {
      const clientPhone = this.formatPhoneNumber(process.env.CLIENT_WHATSAPP_PHONE);
      if (clientPhone) adminPhones.push(clientPhone);
    }
    
    const adminResults = await this.sendBulkWhatsApp(adminPhones, subject, message);
    
    return { customerResult, adminResults };
  },

  async sendOrderStatusUpdate(orderData, customerData, statusMessage, expectedDeliveryDate, adminUsers) {
    const { subject, message } = whatsappTemplates.orderStatusUpdate(
      orderData, 
      customerData, 
      statusMessage, 
      expectedDeliveryDate
    );
    
    // Send to customer
    const customerResult = await this.sendWhatsApp(customerData.phone, subject, message);
    
    // Send notification to admins
    const adminPhones = this.getPhoneNumbers(adminUsers);
    if (process.env.CLIENT_WHATSAPP_PHONE) {
      const clientPhone = this.formatPhoneNumber(process.env.CLIENT_WHATSAPP_PHONE);
      if (clientPhone) adminPhones.push(clientPhone);
    }
    
    const adminMessage = `🔄 *ADMIN NOTIFICATION*\n\n` +
                        `Order ${orderData.orderNumber} status updated by admin to: ${orderData.status.replace('_', ' ').toUpperCase()}\n\n` +
                        `Customer: ${customerData.name} (${customerData.company})\n` +
                        `${statusMessage ? `Message sent: "${statusMessage}"\n` : ''}` +
                        `${expectedDeliveryDate ? `Expected delivery: ${new Date(expectedDeliveryDate).toLocaleDateString()}\n` : ''}`;
    
    const adminResults = await this.sendBulkWhatsApp(
      adminPhones, 
      `Admin Update - ${orderData.orderNumber}`, 
      adminMessage
    );
    
    return { customerResult, adminResults };
  },

  async sendNewMessageNotification(orderData, senderData, messageContent, recipientPhones, isAdminSender = false) {
    const { subject, message } = whatsappTemplates.newMessage(
      orderData, 
      senderData, 
      messageContent, 
      isAdminSender
    );
    
    const formattedPhones = recipientPhones
      .map(phone => this.formatPhoneNumber(phone))
      .filter(phone => phone);
    
    const results = await this.sendBulkWhatsApp(formattedPhones, subject, message);
    return results;
  },

  async sendDocumentUploadNotification(orderData, customerData, documentType, adminUsers) {
    const { subject, message } = whatsappTemplates.documentUploaded(orderData, customerData, documentType);
    
    console.log('Sending WhatsApp document upload notifications...');
    
    // Send to customer
    const customerResult = await this.sendWhatsApp(customerData.phone, subject, message);
    console.log('Customer WhatsApp result:', customerResult);
    
    // Send notification to admins
    const adminPhones = this.getPhoneNumbers(adminUsers);
    if (process.env.CLIENT_WHATSAPP_PHONE) {
      const clientPhone = this.formatPhoneNumber(process.env.CLIENT_WHATSAPP_PHONE);
      if (clientPhone) adminPhones.push(clientPhone);
    }
    
    const docName = documentType === 'test-report' ? 'Test Report' : 'Invoice';
    const adminMessage = `📄 *DOCUMENT UPLOADED*\n\n` +
                        `${docName} uploaded for order ${orderData.orderNumber}\n\n` +
                        `Customer: ${customerData.name} (${customerData.company})\n` +
                        `Customer has been notified via WhatsApp.`;
    
    const adminResults = await this.sendBulkWhatsApp(
      adminPhones, 
      `Document Upload - ${docName}`, 
      adminMessage
    );
    console.log('Admin WhatsApp results:', adminResults);
    
    return { customerResult, adminResults };
  },

  async sendOrderApprovalNotification(orderData, customerData, message, expectedDeliveryDate, adminUsers) {
    const { subject, message: whatsappMessage } = whatsappTemplates.orderApproval(
      orderData, 
      customerData, 
      message, 
      expectedDeliveryDate
    );
    
    // Send to customer
    const customerResult = await this.sendWhatsApp(customerData.phone, subject, whatsappMessage);
    
    // Send notification to admins
    const adminPhones = this.getPhoneNumbers(adminUsers);
    if (process.env.CLIENT_WHATSAPP_PHONE) {
      const clientPhone = this.formatPhoneNumber(process.env.CLIENT_WHATSAPP_PHONE);
      if (clientPhone) adminPhones.push(clientPhone);
    }
    
    const adminMessage = `✅ *ORDER APPROVED*\n\n` +
                        `Order ${orderData.orderNumber} has been approved.\n\n` +
                        `Customer: ${customerData.name} (${customerData.company})\n` +
                        `${expectedDeliveryDate ? `Expected delivery: ${new Date(expectedDeliveryDate).toLocaleDateString()}\n` : ''}` +
                        `${message ? `Message sent: "${message}"` : ''}`;
    
    const adminResults = await this.sendBulkWhatsApp(
      adminPhones, 
      `Order Approved - ${orderData.orderNumber}`, 
      adminMessage
    );
    
    return { customerResult, adminResults };
  },

  async sendOrderRejectionNotification(orderData, customerData, message, adminUsers) {
    const { subject, message: whatsappMessage } = whatsappTemplates.orderRejection(
      orderData, 
      customerData, 
      message
    );
    
    // Send to customer
    const customerResult = await this.sendWhatsApp(customerData.phone, subject, whatsappMessage);
    
    // Send notification to admins
    const adminPhones = this.getPhoneNumbers(adminUsers);
    if (process.env.CLIENT_WHATSAPP_PHONE) {
      const clientPhone = this.formatPhoneNumber(process.env.CLIENT_WHATSAPP_PHONE);
      if (clientPhone) adminPhones.push(clientPhone);
    }
    
    const adminMessage = `❌ *ORDER REJECTED*\n\n` +
                        `Order ${orderData.orderNumber} has been rejected.\n\n` +
                        `Customer: ${customerData.name} (${customerData.company})\n` +
                        `${message ? `Reason: "${message}"` : ''}`;
    
    const adminResults = await this.sendBulkWhatsApp(
      adminPhones, 
      `Order Rejected - ${orderData.orderNumber}`, 
      adminMessage
    );
    
    return { customerResult, adminResults };
  },

  async sendOrderCancellationNotification(orderData, customerData, reason, adminUsers) {
    const { subject, message: whatsappMessage } = whatsappTemplates.orderCancellation(
      orderData, 
      customerData, 
      reason
    );
    
    // Send to customer
    const customerResult = await this.sendWhatsApp(customerData.phone, subject, whatsappMessage);
    
    // Send notification to admins
    const adminPhones = this.getPhoneNumbers(adminUsers);
    if (process.env.CLIENT_WHATSAPP_PHONE) {
      const clientPhone = this.formatPhoneNumber(process.env.CLIENT_WHATSAPP_PHONE);
      if (clientPhone) adminPhones.push(clientPhone);
    }
    
    const adminMessage = `🔄 *ORDER CANCELLED*\n\n` +
                        `Order ${orderData.orderNumber} has been cancelled by customer.\n\n` +
                        `Customer: ${customerData.name} (${customerData.company})\n` +
                        `${reason ? `Reason: "${reason}"` : 'No reason provided'}`;
    
    const adminResults = await this.sendBulkWhatsApp(
      adminPhones, 
      `Order Cancelled - ${orderData.orderNumber}`, 
      adminMessage
    );
    
    return { customerResult, adminResults };
  }
};

module.exports = whatsappService;