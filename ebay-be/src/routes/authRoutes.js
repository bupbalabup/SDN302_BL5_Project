import express from "express";
import {
  registerUser,
  resendOtp,
  verifyEmail,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../controllers/authController.js";

const router = express.Router();

// 🧩 Đăng ký tài khoản mới
router.post("/register", registerUser);

// 🧩 Gửi lại mã OTP qua email
router.post("/resend-otp", resendOtp);

// 🧩 Xác thực OTP (kích hoạt tài khoản)
router.post("/verify-email", verifyEmail);

// 🧩 Đăng nhập
router.post("/login", loginUser);

// 🧩 Cấp lại access token khi hết hạn
router.post("/refresh-token", refreshAccessToken);

// 🧩 Đăng xuất (xóa refresh token)
router.post("/logout", logoutUser);

export default router;
