import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import emailService from './emailService.js';
import logger from '../utils/logger.js';
import paymentPluginManager from '../plugins/PaymentPluginManager.js';

class PaymentService {
  /**
   * Tạo security key cho thanh toán
   */
  generateSecurityKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Tạo transaction ID duy nhất
   */
  generateTransactionId(paymentMethod) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${paymentMethod}-${timestamp}-${random}`;
  }

  /**
   * Xác thực security key
   */
  verifySecurityKey(storedKey, providedKey) {
    return crypto.timingSafeEqual(
      Buffer.from(storedKey),
      Buffer.from(providedKey)
    );
  }

  /**
   * Xử lý thanh toán COD (Cash on Delivery)
   */
  async processCODPayment(paymentData) {
    try {
      const startTime = Date.now();

      const {
        orderId,
        buyerId,
        amount,
        paymentDetails,
        ipAddress,
        userAgent
      } = paymentData;

      // Kiểm tra đơn hàng tồn tại
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Đơn hàng không tồn tại');
      }

      // Kiểm tra amount khớp với order
      if (order.totalPrice !== amount) {
        throw new Error('Số tiền thanh toán không khớp với đơn hàng');
      }

      // Tạo transaction ID và security key
      const transactionId = this.generateTransactionId('COD');
      const securityKey = this.generateSecurityKey();

      // Tạo payment record
      const payment = new Payment({
        orderId,
        buyerId,
        amount,
        paymentMethod: 'COD',
        status: 'pending',
        transactionId,
        securityKey,
        paymentDetails,
        metadata: {
          ipAddress,
          userAgent
        }
      });

      await payment.save();

      // Mô phỏng xử lý thanh toán COD (tức thời)
      // COD không cần xác thực từ bên thứ ba, chỉ cần xác nhận người dùng đồng ý
      payment.status = 'completed';
      payment.confirmedAt = new Date();
      await payment.save();

      // Cập nhật trạng thái đơn hàng
      order.status = 'Confirmed';
      await order.save();

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        payment: {
          id: payment._id,
          transactionId,
          status: payment.status,
          amount,
          paymentMethod: 'COD',
          message: 'Thanh toán COD đã được xác nhận. Vui lòng thanh toán khi nhận hàng.'
        },
        processingTime // ms
      };
    } catch (error) {
      console.error('COD Payment Error:', error);
      throw error;
    }
  }

  /**
   * Xử lý thanh toán PayPal mô phỏng
   */
  async processPayPalPayment(paymentData) {
    const transactionId = logger.constructor.generateTransactionId('PAYPAL');

    logger.logTransactionStart('PaymentService', transactionId, 'processPayPalPayment', {
      orderId: paymentData.orderId,
      amount: paymentData.amount
    });

    try {
      const startTime = Date.now();

      const {
        orderId,
        buyerId,
        amount,
        paymentDetails,
        ipAddress,
        userAgent
      } = paymentData;

      // Kiểm tra đơn hàng tồn tại
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Đơn hàng không tồn tại');
      }

      // Kiểm tra amount khớp với order
      if (order.totalPrice !== amount) {
        throw new Error('Số tiền thanh toán không khớp với đơn hàng');
      }

      // Sử dụng PayPal Payment Plugin
      const pluginResult = await paymentPluginManager.processPayment(
        'PayPal',
        { orderId, buyerId, amount, paymentDetails },
        transactionId
      );

      // Tạo security key
      const securityKey = this.generateSecurityKey();

      // Tạo payment record
      const payment = new Payment({
        orderId,
        buyerId,
        amount,
        paymentMethod: 'PayPal',
        status: pluginResult.status,
        transactionId,
        securityKey,
        paymentDetails: {
          ...paymentDetails,
          gatewayTransactionId: pluginResult.gatewayTransactionId,
          redirectUrl: pluginResult.redirectUrl
        },
        metadata: {
          ipAddress,
          userAgent,
          pluginProcessingTime: pluginResult.processingTime
        }
      });

      await payment.save();

      // Nếu payment hoàn tất, cập nhật order
      if (pluginResult.status === 'completed') {
        payment.confirmedAt = new Date();
        await payment.save();

        order.status = 'Confirmed';
        await order.save();
      }

      const processingTime = Date.now() - startTime;

      logger.logPayment(transactionId, 'PayPal', amount, pluginResult.status, {
        orderId,
        buyerId,
        paymentId: payment._id,
        gatewayTransactionId: pluginResult.gatewayTransactionId,
        processingTime
      });

      logger.logTransactionSuccess('PaymentService', transactionId, 'processPayPalPayment', {
        paymentId: payment._id,
        status: pluginResult.status,
        processingTime
      });

      return {
        success: true,
        payment: {
          id: payment._id,
          transactionId,
          status: payment.status,
          amount,
          paymentMethod: 'PayPal',
          message: pluginResult.message,
          redirectUrl: pluginResult.redirectUrl
        },
        processingTime // ms
      };
    } catch (error) {
      logger.logTransactionFailure('PaymentService', transactionId, 'processPayPalPayment', error, {
        orderId: paymentData.orderId,
        amount: paymentData.amount
      });
      throw error;
    }
  }

  /**
   * Mô phỏng xác thực PayPal
   */
  async simulatePayPalVerification(amount, email) {
    // Mô phỏng gọi API PayPal
    return new Promise((resolve) => {
      // Giả lập độ trễ từ PayPal (200-500ms)
      const delay = Math.random() * 300 + 200;

      setTimeout(() => {
        // Mô phỏng: 95% thanh toán thành công, 5% thất bại
        const isSuccess = Math.random() > 0.05;

        if (isSuccess) {
          resolve({
            success: true,
            transactionId: `PP-${Date.now()}`
          });
        } else {
          resolve({
            success: false,
            reason: 'Insufficient funds or card declined'
          });
        }
      }, delay);
    });
  }

  /**
   * Lấy thông tin thanh toán
   */
  async getPaymentInfo(paymentId) {
    const transactionId = logger.constructor.generateTransactionId('GET-PMT');

    try {
      logger.debug('PaymentService', 'Getting payment info', transactionId, { paymentId });

      const payment = await Payment.findById(paymentId)
        .populate('orderId', 'totalPrice status')
        .populate('buyerId', 'email name');

      if (!payment) {
        throw new Error('Không tìm thấy thông tin thanh toán');
      }

      return payment;
    } catch (error) {
      logger.error('PaymentService', 'Failed to get payment info', transactionId, {
        paymentId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Lấy lịch sử thanh toán của người dùng
   */
  async getUserPaymentHistory(buyerId, limit = 10, skip = 0) {
    try {
      const payments = await Payment.find({ buyerId })
        .populate('orderId', 'totalPrice status')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Payment.countDocuments({ buyerId });

      return {
        payments,
        total,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Get Payment History Error:', error);
      throw error;
    }
  }

  /**
   * Hủy thanh toán
   */
  async cancelPayment(paymentId, buyerId) {
    const transactionId = logger.constructor.generateTransactionId('CANCEL-PMT');

    logger.logTransactionStart('PaymentService', transactionId, 'cancelPayment', {
      paymentId,
      buyerId
    });

    try {
      const payment = await Payment.findById(paymentId);

      if (!payment) {
        throw new Error('Không tìm thấy thanh toán');
      }

      if (payment.buyerId.toString() !== buyerId.toString()) {
        throw new Error('Không có quyền hủy thanh toán này');
      }

      if (payment.status === 'completed') {
        throw new Error('Không thể hủy thanh toán đã hoàn tất');
      }

      // Sử dụng plugin để cancel
      const pluginName = payment.paymentMethod === 'PayPal' ? 'PayPal' : 'COD';
      await paymentPluginManager.cancelPayment(
        pluginName,
        paymentId,
        'Cancelled by user',
        transactionId
      );

      payment.status = 'cancelled';
      await payment.save();

      // Cập nhật đơn hàng về trạng thái hủy
      const order = await Order.findById(payment.orderId);
      if (order) {
        order.status = 'Canceled';
        await order.save();
      }

      logger.logTransactionSuccess('PaymentService', transactionId, 'cancelPayment', {
        paymentId,
        orderId: payment.orderId
      });

      return {
        success: true,
        message: 'Thanh toán đã bị hủy'
      };
    } catch (error) {
      logger.logTransactionFailure('PaymentService', transactionId, 'cancelPayment', error, {
        paymentId,
        buyerId
      });
      throw error;
    }
  }

  /**
   * Gửi email xác nhận thanh toán
   */
  async sendPaymentConfirmationEmail(payment, user) {
    try {
      const order = await Order.findById(payment.orderId).populate('items.productId');

      const orderData = {
        orderId: payment.orderId,
        totalAmount: payment.amount,
        paymentMethod: payment.paymentMethod === 'PayPal' ? 'PayPal' : 'Thanh toán khi nhận hàng (COD)',
        status: 'confirmed',
        createdAt: payment.createdAt,
        items: order.items.map(item => ({
          name: item.productId?.title || 'Sản phẩm',
          quantity: item.quantity,
          price: item.unitPrice
        }))
      };

      await emailService.sendPaymentConfirmation(user.email, orderData);
      console.log(`Payment confirmation email sent to ${user.email}`);
    } catch (error) {
      console.error('Send Payment Email Error:', error);
    }
  }
}

export default new PaymentService();
