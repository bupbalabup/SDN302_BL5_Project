import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    // Kiểm tra nếu sử dụng Mailtrap cho testing
    if (process.env.MAILTRAP_HOST) {
      return nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS
        }
      });
    }

    // Cấu hình Gmail/Production
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Template cho email xác nhận thanh toán
  async sendPaymentConfirmation(userEmail, orderData) {
    const subject = `Xác nhận thanh toán thành công - Đơn hàng #${orderData.orderId}`;
    const html = this.getPaymentConfirmationTemplate(orderData);
    
    return await this.sendEmail(userEmail, subject, html);
  }

  // Template cho email thay đổi trạng thái đơn hàng
  async sendOrderStatusUpdate(userEmail, orderData) {
    const subject = `Cập nhật trạng thái đơn hàng #${orderData.orderId}`;
    const html = this.getOrderStatusTemplate(orderData);
    
    return await this.sendEmail(userEmail, subject, html);
  }

  // Template cho email chào mừng
  async sendWelcomeEmail(userEmail, userData) {
    const subject = 'Chào mừng bạn đến với eBay Clone!';
    const html = this.getWelcomeTemplate(userData);
    
    return await this.sendEmail(userEmail, subject, html);
  }

  // Template cho email hủy đơn hàng
  async sendOrderCancellationEmail(userEmail, orderData) {
    const subject = `Đơn hàng #${orderData.orderId} đã bị hủy`;
    const html = this.getOrderCancellationTemplate(orderData);
    
    return await this.sendEmail(userEmail, subject, html);
  }

  getPaymentConfirmationTemplate(orderData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .success { color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>eBay Clone</h1>
            <h2>Xác nhận thanh toán thành công</h2>
          </div>
          
          <div class="content">
            <p class="success">✅ Thanh toán của bạn đã được xử lý thành công!</p>
            
            <div class="order-details">
              <h3>Thông tin đơn hàng</h3>
              <p><strong>Mã đơn hàng:</strong> #${orderData.orderId}</p>
              <p><strong>Ngày đặt:</strong> ${new Date(orderData.createdAt).toLocaleDateString('vi-VN')}</p>
              <p><strong>Tổng tiền:</strong> ${orderData.totalAmount?.toLocaleString('vi-VN')}$</p>
              <p><strong>Phương thức thanh toán:</strong> ${orderData.paymentMethod}</p>
              <p><strong>Trạng thái:</strong> ${orderData.status}</p>
            </div>

            ${orderData.items ? `
            <div class="order-details">
              <h3>Sản phẩm đã đặt</h3>
              ${orderData.items.map(item => `
                <p>• ${item.name} - Số lượng: ${item.quantity} - Giá: ${item.price?.toLocaleString('vi-VN')}$</p>
              `).join('')}
            </div>
            ` : ''}

            <p>Cảm ơn bạn đã mua sắm tại eBay Clone!</p>
            <p>Chúng tôi sẽ gửi thông báo khi đơn hàng được vận chuyển.</p>
          </div>
          
          <div class="footer">
            <p>© 2024 eBay Clone. Mọi quyền được bảo lưu.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getOrderStatusTemplate(orderData) {
    const statusMessages = {
      'pending': 'Đơn hàng đang chờ xử lý',
      'confirmed': 'Đơn hàng đã được xác nhận',
      'processing': 'Đơn hàng đang được chuẩn bị',
      'shipped': 'Đơn hàng đã được giao cho đơn vị vận chuyển',
      'delivered': 'Đơn hàng đã được giao thành công',
      'cancelled': 'Đơn hàng đã bị hủy'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status-update { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #0066cc; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>eBay Clone</h1>
            <h2>Cập nhật trạng thái đơn hàng</h2>
          </div>
          
          <div class="content">
            <div class="status-update">
              <h3>Đơn hàng #${orderData.orderId}</h3>
              <p><strong>Trạng thái mới:</strong> ${statusMessages[orderData.status] || orderData.status}</p>
              <p><strong>Thời gian cập nhật:</strong> ${new Date().toLocaleString('vi-VN')}</p>
              
              ${orderData.trackingNumber ? `<p><strong>Mã vận đơn:</strong> ${orderData.trackingNumber}</p>` : ''}
              ${orderData.estimatedDelivery ? `<p><strong>Dự kiến giao hàng:</strong> ${new Date(orderData.estimatedDelivery).toLocaleDateString('vi-VN')}</p>` : ''}
            </div>

            <p>Bạn có thể theo dõi đơn hàng của mình tại trang web của chúng tôi.</p>
            <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
          </div>
          
          <div class="footer">
            <p>© 2024 eBay Clone. Mọi quyền được bảo lưu.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeTemplate(userData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .welcome-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; text-align: center; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Chào mừng đến với eBay Clone!</h1>
          </div>
          
          <div class="content">
            <div class="welcome-box">
              <h2>Xin chào ${userData.name || userData.email}!</h2>
              <p>Cảm ơn bạn đã đăng ký tài khoản tại eBay Clone.</p>
              <p>Bạn có thể bắt đầu mua sắm và khám phá hàng ngàn sản phẩm tuyệt vời.</p>
            </div>

            <p>Với tài khoản của bạn, bạn có thể:</p>
            <ul>
              <li>Mua sắm hàng ngàn sản phẩm</li>
              <li>Theo dõi đơn hàng của bạn</li>
              <li>Lưu sản phẩm yêu thích</li>
              <li>Nhận thông báo về ưu đãi đặc biệt</li>
            </ul>

            <p>Chúc bạn có trải nghiệm mua sắm tuyệt vời!</p>
          </div>
          
          <div class="footer">
            <p>© 2024 eBay Clone. Mọi quyền được bảo lưu.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getOrderCancellationTemplate(orderData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .cancellation-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #dc3545; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { color: #dc3545; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>eBay Clone</h1>
            <h2>Thông báo Hủy Đơn Hàng</h2>
          </div>
          
          <div class="content">
            <p class="warning">❌ Đơn hàng của bạn đã bị hủy</p>
            
            <div class="cancellation-details">
              <h3>Thông tin đơn hàng</h3>
              <p><strong>Mã đơn hàng:</strong> #${orderData.orderId}</p>
              <p><strong>Thời gian hủy:</strong> ${new Date().toLocaleString('vi-VN')}</p>
              <p><strong>Lý do hủy:</strong> ${orderData.reason || 'Yêu cầu từ khách hàng'}</p>
            </div>

            ${orderData.items ? `
            <div class="cancellation-details">
              <h3>Các sản phẩm trong đơn hàng</h3>
              ${orderData.items.map(item => `
                <p>• ${item.name} - Số lượng: ${item.quantity} - Giá: ${item.price?.toLocaleString('vi-VN')}$</p>
              `).join('')}
            </div>
            ` : ''}

            <div class="cancellation-details">
              <h3>Thông tin hoàn tiền</h3>
              <p><strong>Tổng tiền hoàn lại:</strong> ${orderData.totalAmount?.toLocaleString('vi-VN')}$</p>
              <p>Tiền hoàn sẽ được xử lý trong vòng 3-5 ngày làm việc.</p>
            </div>

            <p>Nếu bạn có bất kỳ câu hỏi hoặc cần trợ giúp, vui lòng liên hệ với chúng tôi.</p>
            <p>Cảm ơn đã sử dụng dịch vụ của eBay Clone!</p>
          </div>
          
          <div class="footer">
            <p>© 2024 eBay Clone. Mọi quyền được bảo lưu.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();