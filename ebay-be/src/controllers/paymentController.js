import { handleServerError } from '../helpers/index.js';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import paymentService from '../services/paymentService.js';
import paypalService from '../services/paypalService.js';
import emailService from '../services/emailService.js';

/**
 * POST /api/payments/cod
 * Xử lý thanh toán COD
 */
export const createCODPayment = async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: 'Order ID là bắt buộc'
    });
  }

  try {
    // Kiểm tra đơn hàng
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    if (order.buyerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thanh toán đơn hàng này'
      });
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể thanh toán đơn hàng ở trạng thái "Pending", hiện tại là "${order.status}"`
      });
    }

    // Lấy thông tin người dùng
    const user = await User.findById(userId);

    // Xử lý thanh toán COD
    const paymentResult = await paymentService.processCODPayment({
      orderId,
      buyerId: userId,
      amount: order.totalPrice,
      paymentDetails: {
        email: user.email,
        phone: user.phone || 'N/A',
        address: order.addressId
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Gửi email xác nhận
    try {
      const payment = await Payment.findById(paymentResult.payment.id);
      await paymentService.sendPaymentConfirmationEmail(payment, user);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    // Kiểm tra thời gian xử lý
    if (paymentResult.processingTime > 2000) {
      console.warn(
        `COD Payment processing took ${paymentResult.processingTime}ms (> 2s)`
      );
    }

    return res.status(200).json({
      success: true,
      data: paymentResult,
      message: 'Thanh toán COD đã được xác nhận'
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * POST /api/payments/paypal
 * Xử lý thanh toán PayPal
 */
export const createPayPalPayment = async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: 'Order ID là bắt buộc'
    });
  }

  try {
    // Kiểm tra đơn hàng
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    if (order.buyerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thanh toán đơn hàng này'
      });
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể thanh toán đơn hàng ở trạng thái "Pending", hiện tại là "${order.status}"`
      });
    }

    // Lấy thông tin người dùng
    const user = await User.findById(userId);

    // Xử lý thanh toán PayPal
    const paymentResult = await paymentService.processPayPalPayment({
      orderId,
      buyerId: userId,
      amount: order.totalPrice,
      paymentDetails: {
        email: user.email,
        phone: user.phone || 'N/A',
        address: order.addressId
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Kiểm tra thời gian xử lý
    if (paymentResult.processingTime > 2000) {
      console.warn(
        `PayPal Payment processing took ${paymentResult.processingTime}ms (> 2s)`
      );
    }

    return res.status(200).json({
      success: true,
      data: paymentResult,
      message: 'Thanh toán PayPal đang chờ xác nhận'
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * GET /api/payments/:id
 * Lấy thông tin thanh toán
 */
export const getPaymentInfo = async (req, res) => {
  const userId = req.user.id;
  const paymentId = req.params.id;

  try {
    const payment = await paymentService.getPaymentInfo(paymentId);

    // Kiểm tra quyền truy cập
    if (payment.buyerId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem thông tin thanh toán này'
      });
    }

    return res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * GET /api/payments/history
 * Lấy lịch sử thanh toán
 */
export const getPaymentHistory = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (page - 1) * limit;
    const result = await paymentService.getUserPaymentHistory(
      userId,
      parseInt(limit),
      skip
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * PUT /api/payments/:id/cancel
 * Hủy thanh toán
 */
export const cancelPayment = async (req, res) => {
  const userId = req.user.id;
  const paymentId = req.params.id;

  try {
    const result = await paymentService.cancelPayment(paymentId, userId);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * POST /api/payments/verify
 * Xác thực thanh toán bằng security key
 */
export const verifyPayment = async (req, res) => {
  const userId = req.user.id;
  const { paymentId, securityKey } = req.body;

  if (!paymentId || !securityKey) {
    return res.status(400).json({
      success: false,
      message: 'Payment ID và Security Key là bắt buộc'
    });
  }

  try {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thanh toán'
      });
    }

    if (payment.buyerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xác thực thanh toán này'
      });
    }

    // Xác thực security key
    const isValid = paymentService.verifySecurityKey(payment.securityKey, securityKey);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Security Key không hợp lệ'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Thanh toán đã được xác thực',
      data: {
        paymentId: payment._id,
        status: payment.status,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod
      }
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * POST /api/payments/paypal/create
 * Tạo đơn hàng PayPal thực tế
 */
export const createPayPalOrder = async (req, res) => {
  const { orderId } = req.body;

  console.log('🔵 createPayPalOrder called with:', { orderId, hasUser: !!req.user });

  if (!orderId) {
    console.log('❌ Missing orderId');
    return res.status(400).json({
      success: false,
      message: 'Order ID là bắt buộc'
    });
  }

  try {
    // Kiểm tra đơn hàng
    console.log('🔍 Finding order:', orderId);
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) {
      console.log('❌ Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    console.log('✅ Order found:', {
      orderId: order._id,
      status: order.status,
      buyerId: order.buyerId,
      itemsCount: order.items.length,
      totalPrice: order.totalPrice
    });

    // Get userId from authenticated user or from order
    const userId = req.user?.id || order.buyerId.toString();

    console.log('👤 User check:', { userId, orderBuyerId: order.buyerId.toString(), match: order.buyerId.toString() === userId.toString() });

    if (order.buyerId.toString() !== userId.toString()) {
      console.log('❌ User not authorized');
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thanh toán đơn hàng này'
      });
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== 'Pending') {
      console.log('❌ Invalid order status:', order.status);
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể thanh toán đơn hàng ở trạng thái "Pending", hiện tại là "${order.status}"`
      });
    }

    // Tạo đơn hàng trên PayPal
    const orderDetails = {
      items: order.items.map(item => ({
        name: item.productId?.title || 'Sản phẩm',
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.unitPrice) || 0
      }))
    };

    console.log('📦 Order Details for PayPal:', JSON.stringify(orderDetails, null, 2));
    console.log('💰 Total Price:', order.totalPrice);

    const paypalResult = await paypalService.createOrder(
      orderId,
      order.totalPrice,
      orderDetails
    );

    console.log('💳 PayPal Result:', paypalResult);

    if (!paypalResult.success) {
      console.log('❌ PayPal order creation failed:', paypalResult.message);
      return res.status(400).json({
        success: false,
        message: paypalResult.message
      });
    }

    // Lưu payment record
    const payment = new Payment({
      orderId,
      buyerId: userId,
      amount: order.totalPrice,
      paymentMethod: 'PayPal',
      status: 'pending',
      transactionId: paypalResult.paypalOrderId,
      securityKey: paymentService.generateSecurityKey(),
      paymentDetails: {
        email: order.buyerId.email,
        paypalOrderId: paypalResult.paypalOrderId
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    await payment.save();

    return res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        paypalOrderId: paypalResult.paypalOrderId,
        approveUrl: paypalResult.approveUrl,
        status: paypalResult.status
      }
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * POST /api/payments/paypal/capture
 * Capture thanh toán PayPal thực tế
 */
export const capturePayPalOrder = async (req, res) => {
  const { paymentId, paypalOrderId } = req.body;

  if (!paymentId || !paypalOrderId) {
    return res.status(400).json({
      success: false,
      message: 'Payment ID và PayPal Order ID là bắt buộc'
    });
  }

  try {
    // Tìm payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thanh toán'
      });
    }

    // Get userId from authenticated user or from payment record
    const userId = req.user?.id || payment.buyerId.toString();

    if (payment.buyerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thanh toán này'
      });
    }

    // Capture order từ PayPal
    const captureResult = await paypalService.captureOrder(paypalOrderId);

    if (!captureResult.success) {
      payment.status = 'failed';
      await payment.save();

      return res.status(400).json({
        success: false,
        message: captureResult.message
      });
    }

    // Cập nhật payment
    payment.status = 'completed';
    payment.transactionId = captureResult.transactionId;
    payment.confirmedAt = new Date();
    await payment.save();

    // Cập nhật order status
    const order = await Order.findByIdAndUpdate(payment.orderId, {
      status: 'Processing'
    }, { new: true })
      .populate('buyerId')
      .populate('items.productId', 'title price');

    // Gửi email xác nhận
    try {
      const orderData = {
        orderId: order._id,
        totalAmount: order.totalPrice,
        paymentMethod: 'PayPal',
        status: 'processing',
        createdAt: order.createdAt || new Date(),
        items: order.items.map(item => ({
          name: item.productId?.title || 'Sản phẩm',
          quantity: item.quantity,
          price: item.unitPrice
        }))
      };

      await emailService.sendPaymentConfirmation(order.buyerId.email, orderData);
      console.log(`Payment confirmation email sent to ${order.buyerId.email}`);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: 'Thanh toán PayPal thành công',
      data: {
        paymentId: payment._id,
        orderId: payment.orderId,
        status: 'completed',
        transactionId: captureResult.transactionId,
        amount: captureResult.amount,
        payer: captureResult.payer
      }
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};
