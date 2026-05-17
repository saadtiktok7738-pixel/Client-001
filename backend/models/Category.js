import mongoose from "mongoose";

const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, default: "" },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

export default mongoose.model("Category", CategorySchema);