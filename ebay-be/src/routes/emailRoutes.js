import express from 'express';
import emailService from '../services/emailService.js';

const router = express.Router();

// Route test gửi email
router.post('/test', async (req, res) => {
  try {
    const { to, type, data } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Email recipient is required' });
    }

    let result;
    
    switch (type) {
      case 'payment':
        const orderData = data || {
          orderId: 'TEST001',
          totalAmount: 500000,
          paymentMethod: 'Credit Card',
          status: 'paid',
          createdAt: new Date(),
          items: [
            { name: 'Test Product', quantity: 1, price: 500000 }
          ]
        };
        result = await emailService.sendPaymentConfirmation(to, orderData);
        break;

      case 'status':
        const statusData = data || {
          orderId: 'TEST001',
          status: 'shipped',
          trackingNumber: 'TN123456789',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        };
        result = await emailService.sendOrderStatusUpdate(to, statusData);
        break;

      case 'welcome':
        const userData = data || {
          name: 'Test User',
          email: to
        };
        result = await emailService.sendWelcomeEmail(to, userData);
        break;

      case 'cancellation':
        const cancellationData = data || {
          orderId: 'TEST001',
          totalAmount: 500000,
          reason: 'Yêu cầu từ khách hàng',
          items: [
            { name: 'Test Product', quantity: 1, price: 500000 }
          ]
        };
        result = await emailService.sendOrderCancellationEmail(to, cancellationData);
        break;

      default:
        return res.status(400).json({ error: 'Invalid email type. Use: payment, status, welcome, or cancellation' });
    }

    if (result.success) {
      res.json({ 
        message: 'Email sent successfully', 
        messageId: result.messageId,
        type: type
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send email', 
        details: result.error 
      });
    }

  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route gửi email xác nhận thanh toán
router.post('/payment-confirmation', async (req, res) => {
  try {
    const { email, orderData } = req.body;

    if (!email || !orderData) {
      return res.status(400).json({ error: 'Email and order data are required' });
    }

    const result = await emailService.sendPaymentConfirmation(email, orderData);

    if (result.success) {
      res.json({ message: 'Payment confirmation email sent', messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'Failed to send email', details: result.error });
    }

  } catch (error) {
    console.error('Payment confirmation email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route gửi email cập nhật trạng thái
router.post('/status-update', async (req, res) => {
  try {
    const { email, orderData } = req.body;

    if (!email || !orderData) {
      return res.status(400).json({ error: 'Email and order data are required' });
    }

    const result = await emailService.sendOrderStatusUpdate(email, orderData);

    if (result.success) {
      res.json({ message: 'Status update email sent', messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'Failed to send email', details: result.error });
    }

  } catch (error) {
    console.error('Status update email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route kiểm tra cấu hình email
router.get('/config', async (req, res) => {
  try {
    const config = {
      emailUser: process.env.EMAIL_USER ? '***' + process.env.EMAIL_USER.slice(-10) : 'Not configured',
      emailFrom: process.env.EMAIL_FROM || 'Not configured',
      emailFromName: process.env.EMAIL_FROM_NAME || 'Not configured',
      mailtrapConfigured: !!(process.env.MAILTRAP_HOST && process.env.MAILTRAP_USER),
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(config);
  } catch (error) {
    console.error('Email config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;