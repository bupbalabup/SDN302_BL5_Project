import express from "express";
import {
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getInfoUser,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", authenticateToken, getInfoUser);
router.put("/update-profile", authenticateToken, updateProfile);
router.put("/change-password", changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
