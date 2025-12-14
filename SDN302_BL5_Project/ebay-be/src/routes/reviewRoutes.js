import express from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/reviews/:productId
router.route("/:productId").get(getProductReviews);

// POST /api/reviews
router.route("/").post(authenticateToken, createReview);

// PATCH /api/reviews/:id
// DELETE /api/reviews/:id
router
  .route("/:id")
  .patch(authenticateToken, updateReview)
  .delete(authenticateToken, deleteReview);

export default router;
