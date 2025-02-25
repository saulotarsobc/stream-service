import { Injectable, Logger } from '@nestjs/common';
import { classes, courses } from '@prisma/client';
import { MinioService } from 'src/minio/minio.service';
import { NotifyGateway } from 'src/notify/notify.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateClassesDto,
  CreateCourseDto,
  UpdateClassesDto,
  UpdateCourseDto,
} from './dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifyGateway: NotifyGateway,
    private readonly minioService: MinioService,
  ) {}

  async createCourse(data: CreateCourseDto) {
    return this.prisma.courses.create({ data });
  }

  async updateCourse(id: number, data: UpdateCourseDto) {
    return this.prisma.courses.update({
      where: { id },
      data,
    });
  }

  async getCourses() {
    return this.prisma.courses.findMany();
  }

  async getCourseById(id: number): Promise<courses> {
    return this.prisma.courses.findUnique({
      where: { id },
    });
  }

  async getCourseClasses(id: number): Promise<Omit<classes, 'course_id'>[]> {
    return this.prisma.classes.findMany({
      where: { course_id: id },
      omit: { course_id: true },
      include: {
        videos: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async createClasses(course_id: number, data: CreateClassesDto) {
    return this.prisma.classes.create({
      data: {
        ...data,
        course_id,
      },
    });
  }

  async updateClasses(
    course_id: number,
    class_id: number,
    data: UpdateClassesDto,
  ) {
    return this.prisma.classes.update({
      where: {
        id: class_id,
        course_id,
      },
      data,
    });
  }

  async getClassById(course_id: number, id: number): Promise<classes> {
    return this.prisma.classes.findUnique({
      where: {
        id,
        course_id,
      },
    });
  }

  async uploadVideoFile(
    videoFile: Express.Multer.File,
    course_id: number,
    class_id: number,
  ) {
    // TODO: enviar para o minio
    const videoFilePath = await this.minioService.uploadVideoFile(
      videoFile,
      course_id,
      class_id,
    );

    const url = await this.minioService.generateLink(videoFilePath.finalName);

    return this.prisma.classes_videos.create({
      data: {
        duration: 600,
        url,
        class_id,
      },
    });

    // TODO: salvar no prisma
    // TODO: notificar via socket
    // this.notifyGateway.notify(`up/${course_id}/${class_id}`, videoFile);
  }

  // private async storeVideo(
  //   file: Express.Multer.File,
  //   data: VideoFile,
  // ): Promise<string> {
  //   const outputDir = join(
  //     __dirname,
  //     '..',
  //     '..',
  //     'temp',
  //     data.slug,
  //     data.session,
  //     data.title,
  //   );
  //   await this.clearOutputDir(outputDir);
  //   const videoFilePath = await this.createVideoDirs(outputDir);

  //   const videoDist = join(videoFilePath, 'original.mp4');

  //   await writeFile(videoDist, file.buffer)
  //     .then(() => {
  //       this.logger.log(`File saved to ${videoDist}`);
  //     })
  //     .catch((error) => {
  //       this.logger.error(
  //         `Error saving file to ${videoDist}: ${error.message}`,
  //       );
  //       throw new HttpException(
  //         'Error saving file',
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     });

  //   return videoDist;
  // }

  // public async segmentVideo({
  //   slug,
  //   session,
  //   title,
  //   resolution,
  //   bitrate,
  //   hls_list_size,
  //   hls_time,
  // }: SegmentVideoDto) {
  //   const server = 'http://192.168.1.181:3000';
  //   const input = await this.getVideoFile(slug, session, title);

  //   const outputPath = join(
  //     __dirname,
  //     '..',
  //     '..',
  //     'temp',
  //     slug,
  //     session,
  //     resolution.height,
  //   );

  //   await this.clearOutputDir(outputPath);

  //   await this.createVideoDirs(
  //     join(__dirname, '..', '..', 'temp', slug, session, resolution.height),
  //   );

  //   this.createHLS({
  //     input,
  //     resolution,
  //     outputPath,
  //     baseUrl: `${server}/temp/${slug}/${session}/${resolution.height}/`,
  //     bitrate,
  //     hls_time,
  //     hls_list_size,
  //     slug,
  //     session,
  //   });

  //   const data = {
  //     slug,
  //     session,
  //     title,
  //     resolution,
  //     server,
  //     input,
  //     outputPath,
  //   };

  //   return data;
  // }

  // private async getVideoFile(slug: string, session: string, title: string) {
  //   const videoDir = join(
  //     __dirname,
  //     '..',
  //     '..',
  //     'temp',
  //     slug,
  //     session,
  //     title,
  //     'original',
  //   );
  //   const files = await readdir(videoDir);
  //   const videoPath = join(videoDir, files[0]); // Gets the first file in the directory

  //   try {
  //     await access(videoPath);
  //     return videoPath;
  //   } catch (error) {
  //     this.logger.error(`Video file not found: ${videoPath}`);
  //     throw new HttpException('Video file not found', HttpStatus.NOT_FOUND);
  //   }
  // }

  // private async createHLS({
  //   input,
  //   resolution,
  //   bitrate,
  //   outputPath,
  //   baseUrl,
  //   hls_time,
  //   hls_list_size,
  //   slug,
  //   session,
  // }: CreateHLSParams): Promise<void> {
  //   const eventName = `pro/${slug}/${session}/${resolution.height}`;
  //   return new Promise((resolve, reject) => {
  //     let data: VideoProgress = {
  //       currentFps: 0,
  //       currentKbps: 0,
  //       frames: 0,
  //       percent: 0,
  //       targetSize: 0,
  //       timemark: '00:00:00',
  //     };
  //     Ffmpeg(input)
  //       .inputFormat('mp4')
  //       .outputOptions([
  //         `-threads 0`,
  //         `-vf scale=w=${resolution.width}:h=${resolution.height}:force_original_aspect_ratio=decrease`,
  //         `-c:v libx264`,
  //         `-preset medium`,
  //         `-cq:v 23`,
  //         `-c:a aac`,
  //         `-b:a ${bitrate}`,
  //         `-hls_time ${hls_time}`,
  //         `-hls_list_size ${hls_list_size}`,
  //         `-hls_playlist_type vod`,
  //         `-hls_base_url ${baseUrl}`,
  //         `-hls_segment_filename ${join(outputPath, '%03d.ts')}`,
  //       ])
  //       .output(join(outputPath, 'master.m3u8'))
  //       .on('progress', (ffmpegData) => {
  //         data = {
  //           ...ffmpegData,
  //           slug,
  //           session,
  //           resolution,
  //         };
  //         this.logger.debug(data);
  //         this.notifyGateway.notify(eventName, data);
  //       })
  //       .on('end', () => {
  //         const endData: VideoProgress = {
  //           ...data,
  //           slug,
  //           session,
  //           resolution,
  //           percent: 100,
  //         };

  //         this.logger.debug(endData);
  //         this.notifyGateway.notify(eventName, endData);
  //         resolve();
  //       })
  //       .on('error', (error) => {
  //         console.error(
  //           `Erro na conversão ${resolution.width}x${resolution.height}:`,
  //           error.message,
  //         );
  //         reject(error);
  //       })
  //       .run();
  //   });
  // }

  // private async clearOutputDir(dir: string): Promise<void> {
  //   try {
  //     await rm(dir, { recursive: true, force: true });
  //   } catch (error: any) {
  //     console.error(`Erro ao limpar o diretório ${dir}: ${error.message}`);
  //   }
  //   await mkdir(dir, { recursive: true });
  // }

  // private async createVideoDirs(baseDir: string): Promise<string> {
  //   const dir = join(baseDir);
  //   try {
  //     await mkdir(dir, { recursive: true });
  //     return join(baseDir);
  //   } catch (error: any) {
  //     console.error(`Erro ao criar diretório ${dir}: ${error.message}`);
  //   }
  // }
  // private getVideoDataFromFile(video: Express.Multer.File): VideoFile {
  //   try {
  //     const fname = Buffer.from(video.originalname, 'latin1').toString('utf8');

  //     if (!fname.includes('_')) {
  //       throw new Error('Invalid file name');
  //     }

  //     if (fname.split('_').length !== 3) {
  //       throw new Error('Invalid file extension');
  //     }
  //     const [slug, session, title] = fname.split('_');
  //     return { slug, session, title };
  //   } catch (error) {
  //     this.logger.error(error.message);
  //     throw new HttpException('Invalid file name', HttpStatus.BAD_REQUEST);
  //   }
  // }

  // async getAllVideos() {
  //   const tempDir = join(__dirname, '..', '..', 'temp');
  //   try {
  //     const dirs = await readdir(tempDir, { withFileTypes: true });
  //     return dirs
  //       .filter((dirent) => dirent.isDirectory())
  //       .map((dirent) => dirent.name);
  //   } catch (error) {
  //     this.logger.error(`Error reading temp directory: ${error.message}`);
  //     throw new HttpException(
  //       'Error reading videos directory',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // async getVideo(slug: string) {
  //   const tempDir = join(__dirname, '..', '..', 'temp', slug);
  //   try {
  //     const dirs = await readdir(tempDir, { withFileTypes: true });
  //     return dirs
  //       .filter((dirent) => dirent.isDirectory())
  //       .map((dirent) => dirent.name);
  //   } catch (error) {
  //     this.logger.error(`Error reading temp directory: ${error.message}`);
  //     throw new HttpException(
  //       'Error reading videos directory',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // async getVideoSession(slug: string, session: string) {
  //   const tempDir = join(__dirname, '..', '..', 'temp', slug, session);
  //   try {
  //     const dirs = await readdir(tempDir, { withFileTypes: true });
  //     return dirs
  //       .filter((dirent) => dirent.isDirectory())
  //       .map((dirent) => dirent.name);
  //   } catch (error) {
  //     this.logger.error(`Error reading temp directory: ${error.message}`);
  //     throw new HttpException(
  //       'Error reading videos directory',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
