import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
    priceAtPurchase: Number
  }],
  totalAmount: Number,
  paymentStatus: { type: String, default: "pending" },
  stripeSessionId: String
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);