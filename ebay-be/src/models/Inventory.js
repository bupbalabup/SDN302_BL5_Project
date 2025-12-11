import mongoose from "mongoose";

const inventorySchema = mongoose.Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true,
  },
  quantity: { type: Number, required: true, min: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model("Inventory", inventorySchema, "inventories");
