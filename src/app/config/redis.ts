import Redis from "ioredis";

const redisUrl =
  process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,

  retryStrategy(times) {
    if (times > 3) {
      return null;
    }

    return Math.min(times * 200, 1000);
  },
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("ready", () => {
  console.log("Redis is ready");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});

redis.on("close", () => {
  console.warn("Redis connection closed");
});