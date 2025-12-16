import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'PayPal'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    paymentDetails: {
      email: String,
      phone: String,
      address: String
    },
    securityKey: {
      type: String,
      required: true
    },
    confirmedAt: Date,
    failureReason: String,
    metadata: {
      userAgent: String,
      ipAddress: String
    }
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh
paymentSchema.index({ orderId: 1, buyerId: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
