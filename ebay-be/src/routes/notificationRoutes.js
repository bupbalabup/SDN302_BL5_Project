import express from "express";

import { authenticateToken } from "../middlewares/authMiddleware.js";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController.js";

const notificationRoutes = express.Router();

notificationRoutes.get("/my", authenticateToken, getUserNotifications);

notificationRoutes.post("/:id/read", authenticateToken, markNotificationAsRead);

export default notificationRoutes;
