import mongoose from "mongoose";

const { Schema } = mongoose;

const BannerSchema = new Schema({
  image: { type: String, required: true },
  imageMobile: { type: String, default: null },
  order: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const Banner =
  mongoose.models.Banner || mongoose.model("Banner", BannerSchema);

export default Banner;