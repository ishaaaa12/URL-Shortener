import express from "express";
import mongoose from "mongoose";
import redisClient from "../config/redis.js";

const router = express.Router();

router.get("/", async (req, res) => {
  let mongoStatus = "DOWN";
  let redisStatus = "DOWN";

  try {
    if (mongoose.connection.readyState === 1) {
      mongoStatus = "UP";
    }
  } catch {}

  try {
    await redisClient.ping();

    redisStatus = "UP";
  } catch {}

  const overallStatus =
    mongoStatus === "UP" && redisStatus === "UP" ? "UP" : "DEGRADED";

  return res.json({
    status: overallStatus,
    mongodb: mongoStatus,
    redis: redisStatus,
    uptime: Math.floor(process.uptime()),
  });
});

export default router;
