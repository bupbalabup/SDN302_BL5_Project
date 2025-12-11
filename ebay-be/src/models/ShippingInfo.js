import mongoose from "mongoose";

const shippingInfoSchema = mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  carrier: { type: String, required: true },
  trackingNumber: { type: String, required: true },
  status: {
    type: String,
    default: "Pending_Pickup",
    enum: [
      "Pending_Pickup",
      "In_Transit", 
      "Out_for_Delivery",
      "Delivered",
      "Canceled", 
      "Failed_Attempt", 
    ],
  },
  estimateArrival: { type: Date, required: true },
  deliveredDate: { type: Date },
});

export default mongoose.model("ShippingInfo", shippingInfoSchema);
