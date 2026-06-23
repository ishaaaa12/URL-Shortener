import express from "express";
import Url from "../models/Url.js";
import { nanoid } from "nanoid";
import redisClient from "../config/redis.js";
import ClickEvent from "../models/ClickEvent.js";
import { trackClick } from "../utils/trackClick.js";
import rateLimiter from "../middleware/rateLimiter.js";
import logger from '../utils/logger.js'

const router = express.Router();

router.post("/shorten", rateLimiter(10, 60), async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      new URL(originalUrl);
    } catch (error) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    let shortId;
    let exists = true;

    while (exists) {
      shortId = nanoid(7);
      exists = await Url.findOne({ shortId });
    }

    const url = await Url.create({
      shortId,
      originalUrl,
    });

    await redisClient.set(
      shortId,
      JSON.stringify({
        originalUrl,
        clicks: 0,
      }),
      {
        EX: 86400,
      },
    );

    logger.info({
      event: "url_created",
      shortId,
      originalUrl,
    });

    return res.json({
      shortId: url.shortId,
      shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/analytics/:shortId", async (req, res) => {
  const url = await Url.findOne({
    shortId: req.params.shortId,
  });

  if (!url) {
    return res.status(404).json({
      error: "URL not found",
    });
  }

  const events = await ClickEvent.find({
    shortId: req.params.shortId,
  });

  const totalClicks = await ClickEvent.countDocuments({
    shortId: req.params.shortId,
  });

  const countries = await ClickEvent.aggregate([
    {
      $match: {
        shortId: req.params.shortId,
      },
    },
    {
      $group: {
        _id: "$country",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const browsers = await ClickEvent.aggregate([
    {
      $match: {
        shortId: req.params.shortId,
      },
    },
    {
      $group: {
        _id: "$browser",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const devices = await ClickEvent.aggregate([
    {
      $match: {
        shortId: req.params.shortId,
      },
    },
    {
      $group: {
        _id: "$device",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const uniqueVisitors = await redisClient.sCard(
    `visitors:${req.params.shortId}`,
  );

  return res.json({
    shortId: req.params.shortId,
    totalClicks,
    uniqueVisitors,
    countries,
    browsers,
    devices,
  });
});

router.get("/analytics/:shortId/referrers", async (req, res) => {
  try {
    const { shortId } = req.params;

    const referrers = await ClickEvent.aggregate([
      {
        $match: { shortId },
      },
      {
        $group: {
          _id: "$referrer",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    return res.json(referrers);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      error: "Server error",
    });
  }
});

router.get("/analytics/:shortId/recent", async (req, res) => {
  try {
    const { shortId } = req.params;

    const recent = await ClickEvent.find({
      shortId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(20);

    return res.json(recent);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      error: "Server error",
    });
  }
});

router.get("/dashboard/overview", async (req, res) => {
  try {
    const totalUrls = await Url.countDocuments();

    const totalClicks = await ClickEvent.countDocuments();

    const totalUniqueVisitors = await redisClient
      .keys("visitors:*")
      .then(async (keys) => {
        let total = 0;

        for (const key of keys) {
          total += await redisClient.sCard(key);
        }

        return total;
      });

    return res.json({
      totalUrls,
      totalClicks,
      totalUniqueVisitors,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      error: "Server error",
    });
  }
});

router.get("/dashboard/urls", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            {
              shortId: {
                $regex: search,
                $options: "i",
              },
            },
            {
              originalUrl: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const sort = req.query.sort || "newest";

    let sortOption;

    switch (sort) {
      case "clicks":
        sortOption = { clicks: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "newest":
      default:
        sortOption = { createdAt: -1 };
    }

    const urls = await Url.find(query).sort(sortOption).skip(skip).limit(limit);

    const total = await Url.countDocuments(query);

    return res.json({
      urls,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      error: "Server error",
    });
  }
});

router.get("/dashboard/top-urls", async (req, res) => {
  try {
    const urls = await Url.find().sort({ clicks: -1 }).limit(10);

    res.json(urls);
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
});

router.get("/analytics/:shortId/daily", async (req, res) => {
  try {
    const { shortId } = req.params;

    const daily = await ClickEvent.aggregate([
      {
        $match: { shortId },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          clicks: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return res.json(daily);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      error: "Server error",
    });
  }
});

router.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    const cached = await redisClient.get(shortId);

    if (cached) {
      await redisClient.incr("metrics:cache:hits");

      const data = JSON.parse(cached);

      await redisClient.incr(`clicks:${shortId}`);

      await trackClick(req, shortId);

      logger.info({
        event: "url_redirect",
        shortId,
      });

      return res.redirect(data.originalUrl);
    }

    await redisClient.incr("metrics:cache:misses");

    const url = await Url.findOne({ shortId });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    url.clicks += 1;
    await url.save();

    await redisClient.set(
      shortId,
      JSON.stringify({
        originalUrl: url.originalUrl,
      }),
      {
        EX: 86400,
      },
    );

    await trackClick(req, shortId);

    logger.info({
      event: "url_redirect",
      shortId,
    });

    return res.redirect(url.originalUrl);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
