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

// static files
app.use(express.static("static"));

// Função para buscar arquivos do MinIO
const getFileFromMinio = async (
  bucket: string,
  objectName: string,
  res: Response
) => {
  try {
    const dataStream = await minioClient.getObject(bucket, objectName);
    dataStream.pipe(res);
  } catch (err) {
    res.status(500).send(err);
  }
};

// /aulas/big-buck-bunny/aula-1
app.get("/aulas/:curso/:aula/", (_req: Request, res: Response): any => {
  const objectName = `${_req.params.curso}/${_req.params.aula}/master.m3u8`;
  getFileFromMinio("videos", objectName, res);
});

// /stream/big-buck-bunny/aula-1/low/000.ts
app.get(
  "/stream/:curso/:aula/:quality/:segment",
  (req: Request, res: Response): any => {
    const objectName = `${req.params.curso}/${req.params.aula}/${req.params.quality}/${req.params.segment}`;

    getFileFromMinio("videos", objectName, res);
  }
);

// /stream/big-buck-bunny/aula-1/low/
app.get("/stream/:curso/:aula/:quality", (req: Request, res: Response): any => {
  const objectName = `${req.params.curso}/${req.params.aula}/${req.params.quality}/master.m3u8`;
  getFileFromMinio("videos", objectName, res);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
