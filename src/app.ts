import cors from "cors";
import express from "express";
import parcelRoutes from "./routes/parcelRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const origins = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: origins?.length ? origins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "korea-parcel-marketplace-api" });
});

app.use("/api/parcels", parcelRoutes);

app.use(errorHandler);

export default app;
