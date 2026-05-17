import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, default: "" },
  googleId: { type: String, default: "" },
  avatar: { type: String, default: "" },
  name: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  cart: [
    {
      productId: String,
      quantity: { type: Number, default: 1 },
      color: String,
      addedAt: String,
    },
  ],
  wishlist: [String],
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const User = mongoose.model("User", UserSchema);

export default User;