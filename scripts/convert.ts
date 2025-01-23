import ffmpeg from "fluent-ffmpeg";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

const curso = "big-buck-bunny";
const aula = "aula-1";
const inputFile = join(__dirname, "..", "videos", curso, `${aula}.mp4`);
const outputDir = join(__dirname, "..", "temp", curso, aula);
const server = "http://192.168.1.181:3000";
const hls_time = 10;
const hls_list_size = 0;

type resolutionType = {
  width: number;
  height: number;
};

// Função para limpar o diretório de saída
const clearOutputDir = (dir: string) => {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
  mkdirSync(dir, { recursive: true });
};

// Criação dos diretórios de resoluções
const createResolutionDirs = (baseDir: string, resolutions: string[]) => {
  resolutions.forEach((res: string) => {
    const dir = join(baseDir, res);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
};

/**
 * Cria um arquivo de streaming HLS com base em um vídeo de entrada.
 * @param {string} input - Caminho do arquivo de vídeo de entrada.
 * @param {resolutionType} resolution - Resolução do vídeo de saída.
 * @param {string} bitrate - Taxa de bits do áudio.
 * @param {string} outputPath - Caminho do diretório de saída do arquivo HLS.
 * @param {string} baseUrl - URL base para os arquivos de segmento do HLS.
 * @returns {void} - Promessa que resolve quando o processo terminar.
 */
function createHLS(
  input: string,
  resolution: resolutionType,
  bitrate: string,
  outputPath: string,
  baseUrl: string
) {
  return new Promise((resolve, reject): void => {
    ffmpeg(input)
      .outputOptions([
        `-vf scale=w=${resolution.width}:h=${resolution.height}:force_original_aspect_ratio=decrease`,
        `-c:v libx264`,
        `-preset veryfast`,
        `-crf 23`,
        `-c:a aac`,
        `-b:a ${bitrate}`,
        `-hls_time ${hls_time}`,
        `-hls_list_size ${hls_list_size}`,
        `-hls_playlist_type vod`,
        `-hls_base_url ${baseUrl}`,
        `-hls_segment_filename ${join(outputPath, "%03d.ts")}`,
      ])
      .output(join(outputPath, "master.m3u8"))
      .on("progress", (progress) => {
        console.log(
          `Resolução ${resolution.width}x${resolution.height}: ${
            progress.percent?.toFixed(2) || 0
          }% : ${progress.timemark}`
        );
      })
      .on("end", () => {
        console.log(`Resolução ${resolution.width}x${resolution.height}: 100%`);
        resolve(true);
      })
      .on("error", reject)
      .run();
  });
}

// Função principal
(async () => {
  clearOutputDir(outputDir);
  createResolutionDirs(outputDir, ["low", "medium", "high", "full"]);

  try {
    await createHLS(
      inputFile,
      { width: 426, height: 360 },
      "96k",
      `${outputDir}/low`,
      `${server}/segment/${curso}/${aula}/low/`
    );
    await createHLS(
      inputFile,
      { width: 640, height: 480 },
      "128k",
      `${outputDir}/medium`,
      `${server}/segment/${curso}/${aula}/medium/`
    );
    await createHLS(
      inputFile,
      { width: 854, height: 720 },
      "160k",
      `${outputDir}/high`,
      `${server}/segment/${curso}/${aula}/high/`
    );
    await createHLS(
      inputFile,
      { width: 1920, height: 1080 },
      "192k",
      `${outputDir}/full`,
      `${server}/segment/${curso}/${aula}/full/`
    );

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

    writeFileSync(join(outputDir, "master.m3u8"), masterPlaylist, "utf-8");
    console.log(
      `Conversão para HLS concluída. Arquivos disponíveis na pasta ${outputDir}`
    );
  } catch (error) {
    console.error("Erro durante a conversão:", error);
  }
})();
