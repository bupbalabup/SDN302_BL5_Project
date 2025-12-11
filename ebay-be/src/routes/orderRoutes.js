import express from "express";
import {
  createOrder,
  getOrderDetails,
  updateOrderStatus,
  updateShippingInfoStatus,
  createReturnRequest,
  updateReturnRequestStatus,
  getUserOrder,
  cancelOrder,
} from "../controllers/orderController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/my", authenticateToken, getUserOrder);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/cancel", authenticateToken, cancelOrder);
router.put("/shipping/:orderId/status", updateShippingInfoStatus);
router.put("/returns/:id/status", updateReturnRequestStatus);

router.use(authenticateToken);
router.post("/", createOrder);
router.get("/:id", authenticateToken, getOrderDetails);
router.post("/:id/return", createReturnRequest);

export default router;
