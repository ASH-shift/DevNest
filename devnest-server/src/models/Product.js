import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, index: true },
  description: String,
  price: Number,
  category: String,
  stock: Number,
  image: String
}, { timestamps: true });

export default mongoose.model("Product", productSchema);