import { Redis } from "@upstash/redis";

import type { VisitorStore } from "./register-visit";

const VISITOR_KEY = "portfolio:visitor-count:v1";

export function createRedisVisitorStore(): VisitorStore {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error("Visitor Redis is not configured");
  }

  const redis = new Redis({ url, token });

  return {
    async get() {
      return (await redis.get<number>(VISITOR_KEY)) ?? 0;
    },
    increment() {
      return redis.incr(VISITOR_KEY);
    },
  };
}
