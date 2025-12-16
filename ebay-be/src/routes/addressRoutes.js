import express from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressesByUser,
} from "../controllers/addressController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getAddresses);
// Public: get addresses for a given user (seller) by id
router.get("/user/:userId", getAddressesByUser);
router.post("/", authenticateToken, createAddress);
router.patch("/:id", authenticateToken, updateAddress);
router.delete("/:id", authenticateToken, deleteAddress);

export default router;
