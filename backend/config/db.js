import mongoose from "mongoose";
import { logger } from "../lib/logger.js";

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    logger.error("MONGO_URI env variable is not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  logger.info("MongoDB connected");
}