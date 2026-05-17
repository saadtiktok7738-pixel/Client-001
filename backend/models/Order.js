import mongoose from "mongoose";

const { Schema } = mongoose;

const OrderSchema = new Schema({
  userId: { type: String, default: null },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  note: { type: String, default: "" },
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String,
      color: String,
    },
  ],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  shortId: { type: String, required: true },
  orderId: { type: String, required: true, unique: true },
  courier: { type: String, default: "" },
  trackingId: { type: String, default: "" },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

export default mongoose.model("Order", OrderSchema);