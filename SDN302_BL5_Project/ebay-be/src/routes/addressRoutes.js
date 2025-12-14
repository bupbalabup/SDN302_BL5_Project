import express from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getAddresses);
router.post("/", authenticateToken, createAddress);
router.patch("/:id", authenticateToken, updateAddress);
router.delete("/:id", authenticateToken, deleteAddress);

export default router;
