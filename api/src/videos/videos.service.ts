import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as Ffmpeg from 'fluent-ffmpeg';
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'path';
import { NotifyGateway } from 'src/notify/notify.gateway';
import { CreateHLSParams, VideoFile, VideoProgress } from 'src/ts/interfaces';
import { SegmentVideoDto } from './dto';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(private readonly notifyGateway: NotifyGateway) {}

  async uploadFile(video: Express.Multer.File) {
    const data = this.getVideoDataFromFile(video);
    await this.storeVideo(video, data);
    this.notifyGateway.notify(`up/${data.slug}/${data.session}`, data);

    return {
      ...data,
      size: video.size,
      mimetype: video.mimetype,
    };
  }

  private async storeVideo(
    file: Express.Multer.File,
    data: VideoFile,
  ): Promise<string> {
    const outputDir = join(
      __dirname,
      '..',
      '..',
      'temp',
      data.slug,
      data.session,
    );
    await this.clearOutputDir(outputDir); // TODO: será que isso é necessário?
    const videoFilePath = await this.createVideoDirs(outputDir, 'orignal');

    const videoDist = join(videoFilePath, data.title);

    await writeFile(videoDist, file.buffer)
      .then(() => {
        this.logger.log(`File saved to ${videoDist}`);
      })
      .catch((error) => {
        this.logger.error(
          `Error saving file to ${videoDist}: ${error.message}`,
        );
        throw new HttpException(
          'Error saving file',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    return videoDist;
  }

  public async segmentVideo({
    slug,
    session,
    title,
    resolution,
    bitrate,
    hls_list_size,
    hls_time,
  }: SegmentVideoDto) {
    const server = 'http://192.168.1.181:3000';
    const input = await this.getVideoFile(slug, session, title);

    const outputPath = join(
      __dirname,
      '..',
      '..',
      'temp',
      slug,
      session,
      resolution.height,
    );

    await this.clearOutputDir(outputPath);

    await this.createVideoDirs(
      join(__dirname, '..', '..', 'temp', slug, session),
      resolution.height,
    );

    this.createHLS({
      input,
      resolution,
      outputPath,
      baseUrl: `${server}/temp/${slug}/${session}/${resolution.height}/`,
      bitrate,
      hls_time,
      hls_list_size,
      slug,
      session,
    });

    const data = {
      slug,
      session,
      title,
      resolution,
      server,
      input,
      outputPath,
    };

    return data;
  }

  private async getVideoFile(slug: string, session: string, title: string) {
    const videoDir = join(
      __dirname,
      '..',
      '..',
      'temp',
      slug,
      session,
      'orignal',
    );
    const videoPath = join(videoDir, title);

    try {
      await access(videoPath);
      return videoPath;
    } catch (error) {
      this.logger.error(`Video file not found: ${videoPath}`);
      throw new HttpException('Video file not found', HttpStatus.NOT_FOUND);
    }
  }

  private async createHLS({
    input,
    resolution,
    bitrate,
    outputPath,
    baseUrl,
    hls_time,
    hls_list_size,
    slug,
    session,
  }: CreateHLSParams): Promise<void> {
    const eventName = `pro/${slug}/${session}/${resolution.height}`;
    return new Promise((resolve, reject) => {
      let data: VideoProgress = {
        currentFps: 0,
        currentKbps: 0,
        frames: 0,
        percent: 0,
        targetSize: 0,
        timemark: '00:00:00',
      };
      Ffmpeg(input)
        .inputFormat('mp4')
        .outputOptions([
          `-threads 0`,
          `-vf scale=w=${resolution.width}:h=${resolution.height}:force_original_aspect_ratio=decrease`,
          `-c:v libx264`,
          `-preset medium`,
          `-cq:v 23`,
          `-c:a aac`,
          `-b:a ${bitrate}`,
          `-hls_time ${hls_time}`,
          `-hls_list_size ${hls_list_size}`,
          `-hls_playlist_type vod`,
          `-hls_base_url ${baseUrl}`,
          `-hls_segment_filename ${join(outputPath, '%03d.ts')}`,
        ])
        .output(join(outputPath, 'master.m3u8'))
        .on('progress', (ffmpegData) => {
          data = {
            ...ffmpegData,
            slug,
            session,
            resolution,
          };
          this.logger.debug(data);
          this.notifyGateway.notify(eventName, data);
        })
        .on('end', () => {
          const endData: VideoProgress = {
            ...data,
            slug,
            session,
            resolution,
            percent: 100,
          };

          this.logger.debug(endData);
          this.notifyGateway.notify(eventName, endData);
          resolve();
        })
        .on('error', (error) => {
          console.error(
            `Erro na conversão ${resolution.width}x${resolution.height}:`,
            error.message,
          );
          reject(error);
        })
        .run();
    });
  }

  private async clearOutputDir(dir: string): Promise<void> {
    try {
      await rm(dir, { recursive: true, force: true });
    } catch (error: any) {
      console.error(`Erro ao limpar o diretório ${dir}: ${error.message}`);
    }
    await mkdir(dir, { recursive: true });
  }

  private async createVideoDirs(
    baseDir: string,
    resolution: string,
  ): Promise<string> {
    const dir = join(baseDir, resolution);
    try {
      await mkdir(dir, { recursive: true });
      return join(baseDir, resolution);
    } catch (error: any) {
      console.error(`Erro ao criar diretório ${dir}: ${error.message}`);
    }
  }

  private getVideoDataFromFile(video: Express.Multer.File): VideoFile {
    try {
      const fname = Buffer.from(video.originalname, 'latin1').toString('utf8');

      if (!fname.includes('_')) {
        throw new Error('Invalid file name');
      }

      if (fname.split('_').length !== 3) {
        throw new Error('Invalid file extension');
      }
      const [slug, session, title] = fname.split('_');
      return { slug, session, title };
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException('Invalid file name', HttpStatus.BAD_REQUEST);
    }
  }
}
