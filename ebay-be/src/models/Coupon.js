import mongoose from "mongoose";
const { Schema } = mongoose;

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  maxUsage: { type: Number },
  maxUsagePerUser: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ["active", "expired", "disabled"],
    default: "active",
  },
  productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  usedBy: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      usedCount: { type: Number, default: 1 },
    },
  ],
  type: {
    type: String,
    enum: ["global", "product", "category", "new-user"],
    default: "global",
  },
  minOrderValue: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number },
});

export default mongoose.model("Coupon", couponSchema, "coupons");
