import express from 'express';
import {
  createCODPayment,
  createPayPalPayment,
  getPaymentInfo,
  getPaymentHistory,
  cancelPayment,
  verifyPayment
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả các route thanh toán yêu cầu xác thực
router.use(authenticateToken);

/**
 * POST /api/payments/cod
 * Tạo thanh toán COD
 */
router.post('/cod', createCODPayment);

/**
 * POST /api/payments/paypal
 * Tạo thanh toán PayPal
 */
router.post('/paypal', createPayPalPayment);

/**
 * GET /api/payments/history
 * Lấy lịch sử thanh toán
 */
router.get('/history', getPaymentHistory);

/**
 * GET /api/payments/:id
 * Lấy thông tin thanh toán theo ID
 */
router.get('/:id', getPaymentInfo);

/**
 * PUT /api/payments/:id/cancel
 * Hủy thanh toán
 */
router.put('/:id/cancel', cancelPayment);

/**
 * POST /api/payments/verify
 * Xác thực thanh toán
 */
router.post('/verify', verifyPayment);

export default router;
