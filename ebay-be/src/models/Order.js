import mongoose from "mongoose";
import User from "./User.js";
import Address from "./Address.js";

const orderItemSchema = mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
});

const orderSchema = mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  orderDate: { type: Date, default: Date.now },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    default: "Processing",
    enum: [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Canceled",
      "RequestReturned",
      "Returned",
    ],
  },
  items: [orderItemSchema],
});

export default mongoose.model("Order", orderSchema, "orders");
