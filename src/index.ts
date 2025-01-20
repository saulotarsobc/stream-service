import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import * as Minio from "minio";
import { createClient } from "redis";

dotenv.config();
const app = express();
const port = 3000;
const EXPIRE = 300;

// Habilitar CORS
app.use(cors());

async function main() {
  // Inciar o redis
  const client = createClient({
    url: String(process.env.REDIS_URL),
    password: String(process.env.REDIS_PASSWORD),
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect().then(() => console.log("Redis client connected"));

  // Configuração do cliente MinIO usando variáveis de ambiente
  const minioClient = new Minio.Client({
    endPoint: String(process.env.S3_ENDPOINT),
    port: Number(process.env.S3_PORT),
    useSSL: process.env.S3_USE_SSL == "1",
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
  });
  if (minioClient) console.log("https://min.io conectado");

  // Função para gerar URLs assinadas do MinIO
  const getSignedUrlFromMinio = async (
    bucket: string,
    objectName: string,
    res: Response,
    expires: number = 300 // Tempo padrão de EXPIRE minutos
  ) => {
    try {
      // Tenta buscar a URL no cache do Redis
      const cacheKey = `${bucket}:${objectName}`;
      const cachedUrl = await client.get(cacheKey);

      if (cachedUrl) {
        console.log("Cache hit:", cacheKey);
        return res.redirect(cachedUrl);
      }

      // Se não encontrou no cache, gera uma nova URL assinada
      const url = await minioClient.presignedUrl(
        "GET",
        bucket,
        objectName,
        expires
      );

      // Armazena a URL no Redis com tempo de expiração
      await client
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

  // Adicionar cabeçalhos CORS para permitir solicitações de diferentes origens
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });

  // static files
  app.use(express.static("static"));

  // Ex: /stream/big-buck-bunny/aula-1
  app.get("/stream/:curso/:aula/", (_req: Request, res: Response): any => {
    const objectName = `${_req.params.curso}/${_req.params.aula}/master.m3u8`;
    getSignedUrlFromMinio("videos", objectName, res, EXPIRE);
  });

  // Ex: /stream/big-buck-bunny/aula-1/low/
  app.get(
    "/stream/:curso/:aula/:quality",
    (req: Request, res: Response): any => {
      const objectName = `${req.params.curso}/${req.params.aula}/${req.params.quality}/master.m3u8`;
      getSignedUrlFromMinio("videos", objectName, res, EXPIRE);
    }
  );

  // Ex: /stream/big-buck-bunny/aula-2/medium/000.ts
  app.get(
    "/stream/:curso/:aula/:quality/:segment",
    (req: Request, res: Response): any => {
      const objectName = `${req.params.curso}/${req.params.aula}/${req.params.quality}/${req.params.segment}`;
      getSignedUrlFromMinio("videos", objectName, res, EXPIRE);
    }
  );

  app.listen(port, () => console.log(`Example app listening on port ${port}`));
}

main();
