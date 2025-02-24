import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { Request, Response } from "express";
import { bucket } from "./bucket";
import { redis } from "./redis";

const app = express();
const port = 3000;
const EXPIRE = 300;

// Habilitar CORS
app.use(cors());

// static files
app.use(express.static("static"));

const getSignedUrlFromMinio = async (
  bucketName: string,
  objectName: string,
  res: Response,
  expires: number = 300 // Tempo padrão de EXPIRE minutos
) => {
  try {
    // Tenta buscar a URL no cache do Redis
    const cacheKey = `${bucketName}:${objectName}`;
    const cachedUrl = await redis.get(cacheKey);

    if (cachedUrl) {
      console.log("Cache hit:", cacheKey);
      return res.redirect(cachedUrl);
    }

    // Se não encontrou no cache, gera uma nova URL assinada
    const url = await bucket.presignedUrl(
      "GET",
      bucketName,
      objectName,
      expires
    );

    // Armazena a URL no Redis com tempo de expiração
    await redis
      .set(cacheKey, url, {
        EX: expires, // Expiração em segundos
      })
      .then(() => console.log("Cache set:", cacheKey))
      .catch((err) => console.error("Error setting cache:", err));

    // Redireciona para a nova URL
    return res.redirect(url);
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return res.status(500).send(err);
  }
};

async function main() {
  await redis.connect().then(() => console.log("Redis client connected"));

  // Ex: /stream/big-buck-bunny/aula-1
  app.get("/stream/:curso/:aula/", (_req: Request, res: Response): any => {
    const objectName = `${_req.params.curso}/${_req.params.aula}/master.m3u8`;
    getSignedUrlFromMinio("videos", objectName, res, EXPIRE);
  });

  // Ex: /resolution/big-buck-bunny/aula-1/low/master.m3u8
  app.get(
    "/resolution/:curso/:aula/:quality",
    (req: Request, res: Response): any => {
      const { curso, aula, quality } = req.params;
      const objectName = `${curso}/${aula}/${quality}/master.m3u8`;
      getSignedUrlFromMinio("videos", objectName, res, EXPIRE);
    }
  );

  // Ex: /stream/big-buck-bunny/aula-2/medium/000.ts
  app.get(
    "/segment/:curso/:aula/:quality/:segment",
    (req: Request, res: Response): any => {
      const { curso, aula, quality, segment } = req.params;
      const objectName = `${curso}/${aula}/${quality}/${segment}`;
      getSignedUrlFromMinio("videos", objectName, res, EXPIRE);
    }
  );

  app.listen(port, () => console.log(`Example app listening on port ${port}`));
}

main();
