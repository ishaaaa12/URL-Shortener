import cron from "node-cron";
import redisClient from "../config/redis.js";
import Url from "../models/Url.js";
import logger from '../utils/logger.js'


cron.schedule("* * * * *", async () => {
  try {
    logger.info("Running click sync...");

    const keys = await redisClient.keys("clicks:*");

    const operations = [];

    for (const key of keys) {
      const shortId = key.replace("clicks:", "");

      const clicks = Number(await redisClient.get(key));

      if (clicks > 0) {
        operations.push({
          updateOne: {
            filter: { shortId },
            update: {
              $inc: { clicks },
            },
          },
        });
      }
    }

    if (operations.length > 0) {
      await Url.bulkWrite(operations);
    }

    await Promise.all(keys.map((key) => redisClient.del(key)));

    logger.info({
      event: "click_sync",
      syncedUrls: operations.length,
    });
  } catch (err) {
    logger.error("Sync failed:", err);
  }
});
