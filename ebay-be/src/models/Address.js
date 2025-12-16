import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    provinceId: Number,
    districtId: Number,
    wardCode: String,

    addressDetail: String,
  },
  { timestamps: true }
);

export default mongoose.model("Address", addressSchema);
