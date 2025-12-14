import express from "express";
import {
  getSellerFeedback,
  createFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();

router.route("/").post(createFeedback);

router.route("/:sellerId").get(getSellerFeedback);

export default router;
