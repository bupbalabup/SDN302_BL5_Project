import express from "express";
import {
  ghnWebhook,
  getMyOrderHistory,
  getShippingServices,
  calculateShippingFeeController,

  // 🔥 GHN master data
  getGHNProvinces,
  getGHNDistricts,
  getGHNWards,

  // 🔥 Checkout preview
  checkoutPreview,
} from "../controllers/shippingController.js";

const router = express.Router();

/**
 * =======================
 * GHN WEBHOOK
 * =======================
 */
router.post("/webhook", ghnWebhook);

/**
 * =======================
 * BUYER ORDER HISTORY
 * =======================
 */
router.get("/history", getMyOrderHistory);

/**
 * =======================
 * GHN MASTER DATA (FE xài)
 * =======================
 */
router.get("/ghn/provinces", getGHNProvinces);
router.get("/ghn/districts/:provinceId", getGHNDistricts);
router.get("/ghn/wards/:districtId", getGHNWards);

/**
 * =======================
 * GHN SERVICES
 * =======================
 */
router.get("/services", getShippingServices);

/**
 * =======================
 * CALCULATE SHIPPING FEE
 * (user chọn service)
 * =======================
 */
router.post("/fee", calculateShippingFeeController);

/**
 * =======================
 * CHECKOUT PREVIEW
 * (auto chọn service)
 * =======================
 */
router.post("/checkout-preview", checkoutPreview);

export default router;
