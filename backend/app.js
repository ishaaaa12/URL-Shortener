import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import urlRoutes from "./routes/url.js";
import healthRoutes from "./routes/health.js";
import "./jobs/syncClicks.js";
import metricsRoutes from "./routes/metrics.js";

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

export default app;