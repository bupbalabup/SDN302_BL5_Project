import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import loginGGRoutes from "./routes/loginGGRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import bidRoutes from "./routes/BidRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { startAutoCancelOrders } from "./services/autoCancelOrders.js";
import {
  requestLogger,
  errorLogger,
  transactionContext,
  performanceLogger
} from "./middleware/loggingMiddleware.js";
import logger from "./utils/logger.js";
import shippingRoutes from "./routes/shippingRoutes.js";

connectDB();
startAutoCancelOrders();
const hostname = process.env.HOST_NAME || "localhost";
const port = process.env.PORT || 9999;

const app = express();

// Apply logging middleware first
app.use(requestLogger);
app.use(transactionContext);
app.use(performanceLogger(2000));

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/login", loginGGRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bid", bidRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Wellcome to eBay BE!");
});

// GHN API
app.use("/api/shipping", shippingRoutes);

// Apply error logging middleware
app.use(errorLogger);

app.listen(port, hostname, () => {
  logger.info('SERVER', `Server running at http://${hostname}:${port}/`, null, {
    environment: process.env.NODE_ENV || 'development',
    port,
    hostname
  });
});
