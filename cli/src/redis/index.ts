import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

export const redis = createClient({
  url: String(process.env.REDIS_URL),
  password: String(process.env.REDIS_PASSWORD),
});

redis.on("error", (err) => console.log("Redis Client Error", err));
