import dotenv from "dotenv";
dotenv.config();

import cliProgress from "cli-progress";
import ffmpeg from "fluent-ffmpeg";
import { createReadStream, existsSync, promises as fsPromises } from "fs";
import { setTimeout } from "node:timers/promises";
import { join } from "path";
import { bucket } from "./bucket";

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

const conversionBars = new cliProgress.MultiBar(
  {
    clearOnComplete: true,
    hideCursor: true,
    format: "{name} | {bar} | {percentage}%",
  },
  cliProgress.Presets.shades_classic
);

async function clearOutputDir(dir: string): Promise<void> {
  try {
    await fsPromises.rm(dir, { recursive: true, force: true });
  } catch (error: any) {
    console.error(`Erro ao limpar o diretório ${dir}: ${error.message}`);
  }
  await fsPromises.mkdir(dir, { recursive: true });
}

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
        `-c:v h264_nvenc`,
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
        // Se estiver muito próximo de 100%, forçamos o 100%
        let percent = progressData.percent || 0;
        if (percent >= 99.5) percent = 100;
        progress.update(percent);
      })
      .on("end", () => {
        progress.update(100);
        progress.stop();
        resolve();
      })
      .on("error", (error) => {
        progress.stop();
        console.error(
          `Erro na conversão ${resolution.width}x${resolution.height}:`,
          error.message
        );
        reject(error);
      })
      .run();
  });
}

async function uploadFile(
  bucketName: string,
  filePath: string,
  key: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);

    stream.on("error", (error) => {
      reject(error);
    });

    bucket
      .putObject(bucketName, key, stream)
      .then(() => {
        console.log(`Arquivo enviado com sucesso: ${key}`);
        resolve();
      })
      .catch((err: any) => {
        reject(err);
      });
  });
}

// ===========================
// FUNÇÃO PRINCIPAL
// ===========================

interface UploadFile {
  local: string;
  key: string;
}

(async () => {
  // Verifica se o arquivo de entrada existe
  if (!existsSync(inputFile)) {
    console.error(`Arquivo de entrada não encontrado: ${inputFile}`);
    process.exit(1);
  }

  // Prepara os diretórios de saída
  await clearOutputDir(outputDir);
  await createResolutionDirs(outputDir, resolutions);

  try {
    // Cria barras de conversão individuais para cada resolução
    const progressLow = conversionBars.create(100, 0, { name: "low    " });
    const progressMedium = conversionBars.create(100, 0, { name: "medium " });
    const progressHigh = conversionBars.create(100, 0, { name: "high   " });
    const progressFull = conversionBars.create(100, 0, { name: "full   " });

    // Executa as conversões em paralelo
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
    ]).then(() => {
      console.log("\n\nConversão de todas as resoluções concluída.\n\n");
    });

    await setTimeout(2000);

    // Cria o master playlist (playlist principal)
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
    const masterPlaylistPath = join(outputDir, "master.m3u8");
    await fsPromises.writeFile(masterPlaylistPath, masterPlaylist, "utf-8");

    // Prepara a lista de arquivos para upload
    const filesToUpload: UploadFile[] = [];
    filesToUpload.push({
      local: masterPlaylistPath,
      key: join(curso, aula, "master.m3u8"),
    });

    for (const res of resolutions) {
      const resDir = join(outputDir, res);
      // Master da resolução
      filesToUpload.push({
        local: join(resDir, "master.m3u8"),
        key: join(curso, aula, res, "master.m3u8"),
      });

      // Segmentos .ts
      const files = await fsPromises.readdir(resDir);
      const segmentFiles = files.filter((file) => file.endsWith(".ts"));
      for (const file of segmentFiles) {
        filesToUpload.push({
          local: join(resDir, file),
          key: join(curso, aula, res, file),
        });
      }
    }

    // Realiza o upload de todos os arquivos (em paralelo)
    await Promise.all(
      filesToUpload.map((file) => uploadFile(bucketName, file.local, file.key))
    );

    console.log("\nUpload de todos os arquivos concluído.");
  } catch (error: any) {
    console.error("Erro durante a conversão ou upload:", error.message);
  } finally {
    conversionBars.stop();
  }
})();
