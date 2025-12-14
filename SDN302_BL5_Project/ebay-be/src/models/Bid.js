import mongoose from "mongoose";
import Product from "./Product.js";
import User from "./User.js";
const { Schema } = mongoose;

const bidSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bidAmount: { type: Number, required: true }, // giá đấu hiện tại
  maxAutoBid: { type: Number, default: null }, // giá tối đa mà buyer chấp nhận auto-bid
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Bid", bidSchema, "bids");
