import mongoose from "mongoose";
import User from "./User.js";

const feedbackSchema = mongoose.Schema({
  sellerId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  positiveRate: { type: Number, default: 0 },
});

export default mongoose.model("Feedback", feedbackSchema, "feedbacks");
