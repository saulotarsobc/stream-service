import cors from "cors";
import express, { Request, Response } from "express";
import { join } from "path";

const app = express();
const port = 3000;

// Habilitar CORS
app.use(cors());

// static files
app.use(express.static("static"));

// /aulas/big-buck-bunny/aula-1
app.get("/aulas/:curso/:aula/", (_req: Request, res: Response): any => {
  const file = join(
    __dirname,
    "../temp",
    `${_req.params.curso}`,
    `${_req.params.aula}`,
    "master.m3u8"
  );
  res.sendFile(file);
});

// /stream/big-buck-bunny/aula-1/low/000.ts
app.get(
  "/stream/:curso/:aula/:quality/:segment",
  (req: Request, res: Response): any => {
    const file = join(
      __dirname,
      "../temp",
      `${req.params.curso}`,
      `${req.params.aula}`,
      `${req.params.quality}`,
      `${req.params.segment}`
    );
    res.sendFile(file);
  }
);

// /stream/big-buck-bunny/aula-1/low/
app.get("/stream/:curso/:aula/:quality", (req: Request, res: Response): any => {
  const file = join(
    __dirname,
    "../temp",
    `${req.params.curso}`,
    `${req.params.aula}`,
    `${req.params.quality}`,
    "master.m3u8"
  );

  if (!file) {
    console.error(req.params.quality);
    res.status(404).send("Arquivo nao encontrado");
  }

  res.sendFile(file);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
