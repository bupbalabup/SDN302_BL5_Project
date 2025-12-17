import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    // 👤 Người mua
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📍 Địa chỉ giao
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    // 🛒 Sản phẩm
    items: [orderItemSchema],

    // 💰 Giá tiền (tách rõ)
    subtotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },

    // 🚚 Vận chuyển (GHN)
    shipping: {
      provider: { type: String, default: "GHN" },

      orderCode: { type: String, index: true },

      serviceId: Number,
      serviceTypeId: Number,

      trackingUrl: String,
      expectedDeliveryTime: String,

      status: {
        type: String,
        default: "ready_to_pick",
        enum: [
          "ready_to_pick",
          "picking",
          "picked",
          "storing",
          "transporting",
          "delivering",
          "delivered",
          "cancel",
          "return",
          "returned",
          "exception",
        ],
      },
    },

    // 🧠 Trạng thái nghiệp vụ (frontend xài)
    status: {
      type: String,
      default: "Processing",
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Canceled",
        "RequestReturned",
        "Returned",
      ],
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema, "orders");
