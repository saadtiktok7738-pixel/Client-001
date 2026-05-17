import mongoose from "mongoose";

const { Schema } = mongoose;

const ShippingSettingsSchema = new Schema({
  type: { type: String, enum: ["free", "custom"], default: "free" },
  cost: { type: Number, default: 0 },
});

const ShippingSettings = mongoose.model(
  "ShippingSettings",
  ShippingSettingsSchema
);

export default ShippingSettings;