import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import {
  addToCart,
  applyCoupon,
  clearCart,
  getCart,
  getCartBySeller,
  mergeGuestCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cartController.js";

const cartRoutes = express.Router();

cartRoutes.get("/", authenticateToken, getCart);
cartRoutes.post("/add", authenticateToken, addToCart);
cartRoutes.patch("/update", authenticateToken, updateCartItem);
cartRoutes.delete("/remove/:productId", authenticateToken, removeFromCart);
cartRoutes.delete("/clear", authenticateToken, clearCart);
cartRoutes.get("/by-seller", authenticateToken, getCartBySeller)
// Apply coupon
cartRoutes.post("/apply-coupon", authenticateToken, applyCoupon);

cartRoutes.post("/merge", authenticateToken, mergeGuestCart);

export default cartRoutes;
