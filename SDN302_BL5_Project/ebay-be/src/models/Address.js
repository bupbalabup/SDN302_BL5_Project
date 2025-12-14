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
  isDefault: { type: Boolean, default: false },
});

export default mongoose.model("Address", addressSchema, "addresses")