import mongoose, { Schema } from "mongoose";
import User from "./User.js";

const addressSchema = mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  fullname: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  isDefault: { type: Boolean, default: false },
  // Province/District/Ward for Vietnam addresses
  province: {
    code: { type: String },
    name: { type: String },
  },
  district: {
    code: { type: String },
    name: { type: String },
  },
  ward: {
    code: { type: String },
    name: { type: String },
  },
});

export default mongoose.model("Address", addressSchema, "addresses");
