import dotenv from "dotenv";
dotenv.config();

import cliProgress from "cli-progress";
import ffmpeg from "fluent-ffmpeg";
import { existsSync, promises as fsPromises } from "fs";
import { join } from "path";
import { bucket } from "./bucket";

// Constantes e definições de tipos
const curso = "mysql";
const aula = "aula-0";
const inputFile = join(__dirname, "..", "videos", curso, `${aula}.mp4`);
const outputDir = join(__dirname, "..", "temp", curso, aula);
const server = "http://192.168.1.181:3000";
const hls_time = 10;
const hls_list_size = 0;
const bucketName = "videos";
const resolutions = ["low", "medium", "high", "full"];

type Resolution = {
  width: number;
  height: number;
};

// Configuração do multi progress bar
const progressBars = new cliProgress.MultiBar(
  {
    clearOnComplete: true,
    hideCursor: true,
    format:
      "{name} [{bar}] | {percentage}%/{total} | frames:{frames} | fps:{currentFps} | {timemark}",
  },
  cliProgress.Presets.shades_classic
);

/**
 * Limpa o diretório de saída de forma assíncrona.
 */
async function clearOutputDir(dir: string): Promise<void> {
  try {
    await fsPromises.rm(dir, { recursive: true, force: true });
  } catch (error: any) {
    console.error(`Erro ao limpar o diretório ${dir}: ${error.message}`);
  }
  await fsPromises.mkdir(dir, { recursive: true });
}

/**
 * Cria os diretórios para cada resolução de forma assíncrona.
 */
async function createResolutionDirs(
  baseDir: string,
  resolutions: string[]
): Promise<void> {
  for (const res of resolutions) {
    const dir = join(baseDir, res);
    try {
      await fsPromises.mkdir(dir, { recursive: true });
    } catch (error: any) {
      console.error(`Erro ao criar diretório ${dir}: ${error.message}`);
    }
  }
}

/**
 * Cria um arquivo de streaming HLS a partir de um vídeo de entrada.
 *
 * @param input - Caminho do arquivo de vídeo de entrada.
 * @param resolution - Resolução do vídeo de saída.
 * @param bitrate - Taxa de bits do áudio.
 * @param outputPath - Caminho do diretório de saída do HLS.
 * @param baseUrl - URL base para os segmentos HLS.
 * @param progress - Barra de progresso exclusiva para esta conversão.
 * @returns Uma promessa que se resolve ao fim do processo.
 */
function createHLS(
  input: string,
  resolution: Resolution,
  bitrate: string,
  outputPath: string,
  baseUrl: string,
  progress: cliProgress.SingleBar
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .outputOptions([
        `-vf scale=w=${resolution.width}:h=${resolution.height}:force_original_aspect_ratio=decrease`,
        `-c:v h264_nvenc`, // Usa NVENC (GPU) para codificação de vídeo
        `-preset slow`,
        `-cq:v 23`,
        `-c:a aac`,
        `-b:a ${bitrate}`,
        `-hls_time ${hls_time}`,
        `-hls_list_size ${hls_list_size}`,
        `-hls_playlist_type vod`,
        `-hls_base_url ${baseUrl}`,
        `-hls_segment_filename ${join(outputPath, "%03d.ts")}`,
      ])
      .output(join(outputPath, "master.m3u8"))
      .on("progress", (progressData) => {
        let percent = progressData.percent || 0;
        if (percent >= 99.5) {
          percent = 100;
        }
        progress.update(percent, {
          percentage: percent.toFixed(2),
          timemark: progressData.timemark || "00:00:00",
          frames: progressData.frames || 0,
          total: 100,
          currentFps: progressData.currentFps || 0,
        });
      })
      .on("end", () => {
        progress.update(100, {
          percentage: "100",
          timemark: "00:00:00",
          frames: 0,
          total: 100,
          currentFps: 0,
        });
        progress.stop();
        resolve();
      })
      .on("error", (error) => {
        console.error(
          `Erro na conversão ${resolution.width}x${resolution.height}:`,
          error.message
        );
        progress.stop();
        reject(error);
      })
      .run();
  });
}

/**
 * Faz o upload de um arquivo para o bucket especificado.
 *
 * @param bucketName - Nome do bucket.
 * @param filePath - Caminho do arquivo local.
 * @param key - Chave (path) onde o arquivo será armazenado no bucket.
 */
async function uploadFile(
  bucketName: string,
  filePath: string,
  key: string
): Promise<void> {
  try {
    await bucket.fPutObject(bucketName, key, filePath, {});
    console.log(`Arquivo enviado com sucesso: ${key}`);
  } catch (err: any) {
    console.error(`Erro ao enviar ${key}:`, err.message);
    throw err;
  }
}

// Função principal (IIFE)
(async () => {
  // Verifica se o arquivo de entrada existe
  if (!existsSync(inputFile)) {
    console.error(`Arquivo de entrada não encontrado: ${inputFile}`);
    process.exit(1);
  }

  // Limpa o diretório de saída e cria os diretórios de resolução
  await clearOutputDir(outputDir);
  await createResolutionDirs(outputDir, resolutions);

  try {
    // Criação de barras de progresso individuais para cada resolução
    const progressLow = progressBars.create(100, 0, {
      name: "low    |",
      percentage: "0",
      timemark: "00:00:00",
      frames: 0,
      currentFps: 0,
    });
    const progressMedium = progressBars.create(100, 0, {
      name: "medium |",
      percentage: "0",
      timemark: "00:00:00",
      frames: 0,
      currentFps: 0,
    });
    const progressHigh = progressBars.create(100, 0, {
      name: "high   |",
      percentage: "0",
      timemark: "00:00:00",
      frames: 0,
      currentFps: 0,
    });
    const progressFull = progressBars.create(100, 0, {
      name: "full   |",
      percentage: "0",
      timemark: "00:00:00",
      frames: 0,
      currentFps: 0,
    });

    // Inicia a criação dos arquivos HLS para cada resolução em paralelo
    await Promise.all([
      createHLS(
        inputFile,
        { width: 426, height: 360 },
        "96k",
        join(outputDir, "low"),
        `${server}/segment/${curso}/${aula}/low/`,
        progressLow
      ),
      createHLS(
        inputFile,
        { width: 640, height: 480 },
        "128k",
        join(outputDir, "medium"),
        `${server}/segment/${curso}/${aula}/medium/`,
        progressMedium
      ),
      createHLS(
        inputFile,
        { width: 854, height: 720 },
        "160k",
        join(outputDir, "high"),
        `${server}/segment/${curso}/${aula}/high/`,
        progressHigh
      ),
      createHLS(
        inputFile,
        { width: 1920, height: 1080 },
        "192k",
        join(outputDir, "full"),
        `${server}/segment/${curso}/${aula}/full/`,
        progressFull
      ),
    ]).then(() => console.log("\n\nArquivos HLS criados com sucesso\n\n"));

    // Criação do master playlist
    const masterPlaylist = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=426x360
${server}/resolution/${curso}/${aula}/low/
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x480
${server}/resolution/${curso}/${aula}/medium/
#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x720
${server}/resolution/${curso}/${aula}/high/
#EXT-X-STREAM-INF:BANDWIDTH=4000000,RESOLUTION=1920x1080
${server}/resolution/${curso}/${aula}/full/
`;
    await fsPromises.writeFile(
      join(outputDir, "master.m3u8"),
      masterPlaylist,
      "utf-8"
    );

    // Upload do master playlist
    await uploadFile(
      bucketName,
      join(outputDir, "master.m3u8"),
      join(curso, aula, "master.m3u8")
    );

    // Para cada resolução, realiza o upload do master da resolução e de seus segmentos
    for (const res of resolutions) {
      const resDir = join(outputDir, res);
      // Upload do master da resolução
      await uploadFile(
        bucketName,
        join(resDir, "master.m3u8"),
        join(curso, aula, res, "master.m3u8")
      );
      // Lista os segmentos (.ts) e agrupa os uploads
      const files = await fsPromises.readdir(resDir);
      const segmentFiles = files.filter((file) => file.endsWith(".ts"));
      const uploadPromises = segmentFiles.map((segment) =>
        uploadFile(
          bucketName,
          join(resDir, segment),
          join(curso, aula, res, segment)
        )
      );
      await Promise.all(uploadPromises);
    }
  } catch (error: any) {
    console.error("Erro durante a conversão ou upload:", error.message);
  } finally {
    progressBars.stop();
  }
})();
