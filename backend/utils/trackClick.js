import { getAnalyticsData } from './analytics.js'
import ClickEvent from '../models/ClickEvent.js'
import redisClient from '../config/redis.js'
import logger from './logger.js'

export async function trackClick(req, shortId) {
  const analytics = await getAnalyticsData(req);

  ClickEvent.create({
    shortId,
    ...analytics,
  }).catch(logger.error);

  await redisClient.sAdd(
    `visitors:${shortId}`,
    analytics.ip
  );
}