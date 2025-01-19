import cors from "cors";
import express, { Request, Response } from "express";
import { join } from "node:path";

const app = express();
app.use(cors());

// Rota para servir os arquivos HLS de forma estática
app.use(
  "/big_buck_bunny/",
  express.static(join(__dirname, "../temp/big_buck_bunny/intro"))
);

// Página principal
app.get("/", (_req: Request, res: Response) => {
  res.sendFile(join(__dirname, "../static/index.html"));
});

// Rota para verificar a playlist
app.get("/big_buck_bunny/intro", (_req: Request, res: Response) => {
  const playlistPath = join(
    __dirname,
    "../temp/big_buck_bunny/intro/master.m3u8"
  );
  res.sendFile(playlistPath);
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
