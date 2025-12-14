import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getCouponById,
  getCouponsByUser,
  updateCoupon,
  useCoupon,
} from "../controllers/couponController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/", getAllCoupons);
router.get("/my", authenticateToken, getCouponsByUser);
router.get("/:id", getCouponById);
router.post("/", createCoupon);
router.patch("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);
router.post("/use", authenticateToken, useCoupon);
export default router;
