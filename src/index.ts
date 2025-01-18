import express, { Request, Response } from "express";
import { join } from "node:path";
import { existsSync } from "node:fs";
import cors from "cors";

const app = express();
app.use(cors());

// Rota para servir os arquivos HLS de forma estática
app.use("/aulas/js", express.static(join(__dirname, "../aulas/js")));

// Página principal
app.get("/", (req: Request, res: Response) => {
  res.sendFile(join(__dirname, "../static/index.html"));
});

// Rota para verificar a playlist
app.get("/aulas/js/0001", (req: any, res: any) => {
  const playlistPath = join(__dirname, "../aulas/js/0001/master.m3u8");

  console.log(`Playlist path: ${playlistPath}`);

  if (!existsSync(playlistPath)) {
    return res.status(404).send("A playlist HLS não foi encontrada.");
  }

  res.sendFile(playlistPath);
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
