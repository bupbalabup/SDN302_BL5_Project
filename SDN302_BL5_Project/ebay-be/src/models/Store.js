import mongoose from "mongoose";
import User from "./User.js";

const storeSchema = mongoose.Schema({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  storeName: { type: String, required: true, unique: true },
  description: { type: String },
  bannerImageURL: { type: String },
});

export default mongoose.model("Store", storeSchema, "stores");
