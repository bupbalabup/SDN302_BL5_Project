import express from "express";
import { ghnWebhook, getMyOrderHistory, getShippingServices, calculateShippingFeeController } from "../controllers/shippingController.js";

const router = express.Router();

/**
 * GHN webhook
 */
router.post("/webhook", ghnWebhook);

/**
 * Buyer xem order history + tracking link
 */
router.get("/history", getMyOrderHistory);

/**
 * Lấy danh sách service GHN
 * FE gọi trước khi tính ship
 */
router.get("/services", getShippingServices);

/**
 * Tính phí ship (đã chọn service)
 */
router.post("/fee", calculateShippingFeeController);

export default router;
