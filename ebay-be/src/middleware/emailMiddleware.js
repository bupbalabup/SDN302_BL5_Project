import emailService from '../services/emailService.js';

// Middleware để gửi email sau khi thanh toán thành công
export const sendPaymentConfirmationEmail = async (req, res, next) => {
  try {
    // Lưu response gốc
    const originalSend = res.send;
    
    res.send = function(data) {
      // Kiểm tra nếu thanh toán thành công
      if (res.statusCode === 200 && req.body && req.user) {
        const orderData = {
          orderId: req.body.orderId || req.params.orderId,
          totalAmount: req.body.totalAmount,
          paymentMethod: req.body.paymentMethod,
          status: 'paid',
          createdAt: new Date(),
          items: req.body.items
        };

        // Gửi email bất đồng bộ
        emailService.sendPaymentConfirmation(req.user.email, orderData)
          .then(result => {
            if (result.success) {
              console.log('Payment confirmation email sent successfully');
            } else {
              console.error('Failed to send payment confirmation email:', result.error);
            }
          })
          .catch(error => {
            console.error('Error sending payment confirmation email:', error);
          });
      }
      
      // Gọi response gốc
      originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Email middleware error:', error);
    next();
  }
};

// Middleware để gửi email khi trạng thái đơn hàng thay đổi
export const sendOrderStatusUpdateEmail = async (req, res, next) => {
  try {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode === 200 && req.body && req.body.status) {
        const orderData = {
          orderId: req.params.orderId || req.body.orderId,
          status: req.body.status,
          trackingNumber: req.body.trackingNumber,
          estimatedDelivery: req.body.estimatedDelivery
        };

        // Lấy thông tin user từ database hoặc request
        if (req.user && req.user.email) {
          emailService.sendOrderStatusUpdate(req.user.email, orderData)
            .then(result => {
              if (result.success) {
                console.log('Order status update email sent successfully');
              } else {
                console.error('Failed to send order status update email:', result.error);
              }
            })
            .catch(error => {
              console.error('Error sending order status update email:', error);
            });
        }
      }
      
      originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Email middleware error:', error);
    next();
  }
};

// Middleware để gửi email chào mừng khi đăng ký
export const sendWelcomeEmail = async (req, res, next) => {
  try {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode === 201 && req.body && req.body.email) {
        const userData = {
          name: req.body.name || req.body.username,
          email: req.body.email
        };

        emailService.sendWelcomeEmail(req.body.email, userData)
          .then(result => {
            if (result.success) {
              console.log('Welcome email sent successfully');
            } else {
              console.error('Failed to send welcome email:', result.error);
            }
          })
          .catch(error => {
            console.error('Error sending welcome email:', error);
          });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Email middleware error:', error);
    next();
  }
};