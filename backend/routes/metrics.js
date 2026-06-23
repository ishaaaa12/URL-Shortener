import express from "express";
import Url from "../models/Url.js";
import redisClient from "../config/redis.js";
import logger from '../utils/logger.js'


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const totalUrls = await Url.countDocuments();

    const clickStats = await Url.aggregate([
      {
        $group: {
          _id: null,
          totalClicks: {
            $sum: "$clicks",
          },
        },
      },
    ]);

    const totalClicks = clickStats[0]?.totalClicks || 0;

    const bufferedKeys = await redisClient.keys("clicks:*");

    let redisBufferedClicks = 0;

    for (const key of bufferedKeys) {
      const count = Number(await redisClient.get(key));

      redisBufferedClicks += count;
    }

    const cacheHits = Number(await redisClient.get("metrics:cache:hits")) || 0;

    const cacheMisses =
      Number(await redisClient.get("metrics:cache:misses")) || 0;

    const totalCacheRequests = cacheHits + cacheMisses;

    const cacheHitRate =
      totalCacheRequests > 0
        ? ((cacheHits / totalCacheRequests) * 100).toFixed(2)
        : 0;

    return res.json({
      totalUrls,
      totalClicks,
      redisBufferedClicks,

      uptime: Math.floor(process.uptime()),

      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),

      cacheHits,
      cacheMisses,
      cacheHitRate,
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      error: "Metrics failed",
    });
  }
});

export default router;
