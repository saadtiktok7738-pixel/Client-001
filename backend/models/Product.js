import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    images: [String],
    colors: [String],
    stock: { type: Number, default: 0 },
    isHot: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isLimitedOffer: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;