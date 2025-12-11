import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true }, // giá khởi điểm
  images: [String],
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  // --- Thông tin đấu giá ---
  isAuction: { type: Boolean, default: false },
  startingPrice: { type: Number, default: 0 }, // giá khởi điểm của phiên đấu giá
  currentPrice: { type: Number, default: 0 }, // giá hiện tại (cao nhất)
  highestBidder: { type: Schema.Types.ObjectId, ref: "User" }, // người đang giữ giá cao nhất
  minIncrement: { type: Number, default: 1 }, // bước giá tối thiểu
  auctionEndTime: {
    type: Date,
    required: function () {
      return this.isAuction;
    },
  },
  auctionStatus: {
    type: String,
    enum: ["upcoming", "active", "ended"],
    default: "upcoming",
  },
});

export default mongoose.model("Product", productSchema, "products");
