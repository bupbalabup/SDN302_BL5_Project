import mongoose from "mongoose";
import Coupon from "./Coupon.js";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, sparse: true },
    fullname: String,

    password: { type: String, select: false },

    role: { type: String, default: "user", enum: ["admin", "user", "seller"] },
    avatarURL: { type: String },

    // Xác thực email
    emailVerified: { type: Boolean, default: false },

    // Google login
    googleId: { type: String, unique: true, sparse: true },
    provider: { type: String, enum: ["local", "google"], default: "local" },

    refreshToken: { type: String, select: false },

    // Trạng thái tài khoản
    status: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },

    // === LOCATION (For shipping distance calculation) ===
    // Vĩ độ (Latitude) - Ví dụ: 21.0285 (Hà Nội), 10.7769 (HCM)
    latitude: { type: Number },
    // Kinh độ (Longitude) - Ví dụ: 105.8542 (Hà Nội), 106.6963 (HCM)
    longitude: { type: Number },

    // Coupons
    availableCoupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }],
    usedCoupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema, "users");
