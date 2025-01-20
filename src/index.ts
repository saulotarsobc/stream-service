import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import * as Minio from "minio";

dotenv.config();

const app = express();
const port = 3000;

// Configuração do cliente MinIO usando variáveis de ambiente
const minioClient = new Minio.Client({
  endPoint: String(process.env.MINIO_ENDPOINT),
  port: Number(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL == "1",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Habilitar CORS
app.use(cors());

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

// Função para gerar URLs assinadas do MinIO
const getSignedUrlFromMinio = async (
  bucket: string,
  objectName: string,
  res: Response
) => {
  try {
    console.log(`Buscando: ${objectName}`);
    const url = await minioClient.presignedUrl(
      "GET",
      bucket,
      objectName,
      2 * 60 * 60
    ); // URL válida por 2 horas
    res.redirect(url);
  } catch (err) {
    res.status(500).send(err);
  }
};

// Ex: /aulas/big-buck-bunny/aula-1
app.get("/aulas/:curso/:aula/", (_req: Request, res: Response): any => {
  console.log(">>>>>> playlist master");
  const objectName = `${_req.params.curso}/${_req.params.aula}/master.m3u8`;
  getSignedUrlFromMinio("videos", objectName, res);
});

// Ex: /stream/big-buck-bunny/aula-1/low/
app.get("/stream/:curso/:aula/:quality", (req: Request, res: Response): any => {
  console.log(">>>>>> playlist de qualidade");
  const objectName = `${req.params.curso}/${req.params.aula}/${req.params.quality}/master.m3u8`;
  getSignedUrlFromMinio("videos", objectName, res);
});

// Ex: /videos/big-buck-bunny/aula-2/medium/000.ts
app.get(
  "/stream/:curso/:aula/:quality/:segment",
  (req: Request, res: Response): any => {
    console.log(">>>>>> segment");
    const objectName = `${req.params.curso}/${req.params.aula}/${req.params.quality}/${req.params.segment}`;
    console.debug({ segment: objectName });
    getSignedUrlFromMinio("videos", objectName, res);
  }
);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
