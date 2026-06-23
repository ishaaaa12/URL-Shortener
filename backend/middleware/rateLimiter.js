import redisClient from "../config/redis.js";
import logger from '../utils/logger.js'


export default function rateLimiter(limit = 10, windowSeconds = 60) {
  return async (req, res, next) => {
    try {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress;

      const key = `rate:${ip}`;

      const requests = await redisClient.incr(key);
      const ttl = await redisClient.ttl(key);

      if (requests === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      if (requests > limit) {
        logger.warn({
          event: "rate_limit",
          ip,
        });
          
        return res.status(429).json({
          error: "Too many requests",
          retryAfter: ttl,
        });
      }

      next();
    } catch (error) {
      logger.error("Rate limiter error:", error);

      next();
    }
  };
}
