import express from 'express';
import {
  createCODPayment,
  createPayPalPayment,
  getPaymentInfo,
  getPaymentHistory,
  cancelPayment,
  verifyPayment,
  createPayPalOrder,
  capturePayPalOrder
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/payments/cod
 * Tạo thanh toán COD
 */
router.post('/cod', authenticateToken, createCODPayment);

/**
 * POST /api/payments/paypal
 * Tạo thanh toán PayPal
 */
router.post('/paypal', authenticateToken, createPayPalPayment);

/**
 * GET /api/payments/history
 * Lấy lịch sử thanh toán
 */
router.get('/history', authenticateToken, getPaymentHistory);

/**
 * GET /api/payments/:id
 * Lấy thông tin thanh toán theo ID
 */
router.get('/:id', authenticateToken, getPaymentInfo);

/**
 * PUT /api/payments/:id/cancel
 * Hủy thanh toán
 */
router.put('/:id/cancel', authenticateToken, cancelPayment);

/**
 * POST /api/payments/verify
 * Xác thực thanh toán
 */
router.post('/verify', authenticateToken, verifyPayment);

/**
 * POST /api/payments/paypal/create-test
 * Tạo đơn hàng PayPal thực tế (TEST - no auth)
 */
router.post('/paypal/create-test', createPayPalOrder);

/**
 * POST /api/payments/paypal/create
 * Tạo đơn hàng PayPal thực tế
 */
router.post('/paypal/create', authenticateToken, createPayPalOrder);

/**
 * POST /api/payments/paypal/capture-test
 * Capture thanh toán PayPal thực tế (TEST - no auth)
 */
router.post('/paypal/capture-test', capturePayPalOrder);

/**
 * POST /api/payments/paypal/capture
 * Capture thanh toán PayPal thực tế
 */
router.post('/paypal/capture', authenticateToken, capturePayPalOrder);

export default router;
