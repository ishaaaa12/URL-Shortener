import { UAParser } from "ua-parser-js";
import redisClient from "../config/redis.js";
import logger from './logger.js'

export async function getAnalyticsData(req) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  let country = "Unknown";
  let city = "Unknown";

  try {
    if (ip === "::1" || ip === "127.0.0.1") {
      return {
        ip,
        country: "Local",
        city: "Local",
        browser: "Unknown",
        os: "Unknown",
        device: "desktop",
        referrer: "Direct",
      };
      }
      
    const cacheKey = `geo:${ip}`;

    const cachedGeo = await redisClient.get(cacheKey);

    let geo;

    if (cachedGeo) {
      geo = JSON.parse(cachedGeo);
      logger.info("Geo cache HIT");
    } else {
      logger.info("Geo cache MISS");

      const response = await fetch(
        `https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN}`,
      );

      geo = await response.json();

      await redisClient.set(cacheKey, JSON.stringify(geo), {
        EX: 86400,
      });
    }

    country = geo.country || "Unknown";
    city = geo.city || "Unknown";
  } catch (err) {
    logger.error("Geo lookup failed:", err);
  }

  const parser = new UAParser(req.headers["user-agent"]);

  return {
    ip,
    country,
    city,
    browser: parser.getBrowser().name || "Unknown",

    os: parser.getOS().name || "Unknown",

    device: parser.getDevice().type || "desktop",

    referrer: req.get("referer") || "Direct",
  };
}
