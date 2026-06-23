import client from "prom-client";
import { register } from "./prometheus.js";

export const urlCreatedCounter = new client.Counter({
  name: "url_created_total",
  help: "Total URLs created",
  registers: [register],
});

export const redirectCounter = new client.Counter({
  name: "redirect_total",
  help: "Total redirects",
  registers: [register],
});

export const cacheHitCounter = new client.Counter({
  name: "cache_hit_total",
  help: "Total cache hits",
  registers: [register],
});

export const cacheMissCounter = new client.Counter({
  name: "cache_miss_total",
  help: "Total cache misses",
  registers: [register],
});

export const rateLimitCounter = new client.Counter({
  name: "rate_limit_total",
  help: "Total rate limit violations",
  registers: [register],
});
