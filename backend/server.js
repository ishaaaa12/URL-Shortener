import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import urlRoutes from "./routes/url.js";
import healthRoutes from "./routes/health.js";
import "./jobs/syncClicks.js";
import metricsRoutes from "./routes/metrics.js";
import logger from "./utils/logger.js";
import { connectRedis } from "./config/redis.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  }),
);
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/metrics", metricsRoutes);
app.use("/", urlRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await connectRedis();
    logger.info("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      logger.info(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Error connecting to MongoDB:", err);
  });
