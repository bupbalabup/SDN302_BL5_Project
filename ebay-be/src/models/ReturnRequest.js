import mongoose from "mongoose";
import User from "./User.js";
import Order from "./Order.js";

const returnRequestSchema = mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: String,
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "approved", "rejected", "completed"],
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model(
  "ReturnRequest",
  returnRequestSchema,
  "returnRequests"
);
