import dotenv from "dotenv";
dotenv.config();

import * as Minio from "minio";

export const bucket = new Minio.Client({
  endPoint: String(process.env.S3_ENDPOINT),
  port: Number(process.env.S3_PORT),
  useSSL: process.env.S3_USE_SSL == "1",
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
});
