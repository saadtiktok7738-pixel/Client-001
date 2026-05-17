import mongoose from "mongoose";

const { Schema } = mongoose;

const PresenceSchema = new Schema({
  visitorId: { type: String, required: true, unique: true },
  lastSeen: { type: Date, default: Date.now },
});

// ✅ Prevent OverwriteModelError
const Presence =
  mongoose.models.Presence || mongoose.model("Presence", PresenceSchema);

export default Presence;