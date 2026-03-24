import mongoose from "mongoose";

/**
 * Establishes a singleton connection to MongoDB.
 * Retries once on failure to improve resilience during cold starts (e.g. Render).
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    await new Promise((r) => setTimeout(r, 2000));
    await mongoose.connect(uri);
    console.log("MongoDB connected (retry)");
  }
}
