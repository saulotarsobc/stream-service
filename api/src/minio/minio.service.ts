import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Client } from 'minio';
import { UploadedObjectInfo } from 'minio/dist/main/internal/type';
import { MINIO_CONNECTION } from 'nestjs-minio';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);

  constructor(@Inject(MINIO_CONNECTION) private readonly minioClient: Client) {}

  async uploadVideoFile(
    file: Express.Multer.File,
    video_id: number,
    class_id: number,
  ) {
    const buffer = file.buffer;
    const finalName = `${video_id}/${class_id}/original.mp4`;

    try {
      const info: UploadedObjectInfo = await this.minioClient.putObject(
        process.env.MINIO_BUCKET_NAME,
        finalName,
        buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );

      this.logger.log(`File uploaded successfully: ${finalName}`);
      return {
        finalName,
        ...info,
      };
    } catch (err) {
      this.logger.error(`Failed to upload file: ${file.originalname}`);
      this.logger.error(err);
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async generateLink(finalName: string) {
    this.logger.log(`Generating link for file: ${finalName}`);

    const url = await this.minioClient.presignedGetObject(
      process.env.MINIO_BUCKET_NAME,
      finalName,
    );

    return url;
  }

  async updaloadAvatar(file: Express.Multer.File, userId: number) {
    const buffer = file.buffer;
    const userIdBase64 = Buffer.from(userId.toString()).toString('base64');
    const finalName = `avatars/${userIdBase64}`;

    try {
      const info: UploadedObjectInfo = await this.minioClient.putObject(
        process.env.MINIO_BUCKET_NAME,
        finalName,
        buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );

      this.logger.log(`File uploaded successfully: ${finalName}`);
      return {
        url: `${process.env.MINIO_URL}/${process.env.MINIO_BUCKET_NAME}/${finalName}`,
        info,
      };
    } catch (err) {
      this.logger.error(`Failed to upload file: ${file.originalname}`);
      this.logger.error(err);
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteContract(filename: string) {
    const fileName = '/contracts/' + filename;
    this.logger.log(`Deleting file from minio: ${fileName}`);

    try {
      await this.minioClient.removeObject(
        process.env.MINIO_BUCKET_NAME,
        fileName,
      );
      return true;
    } catch (err) {
      this.logger.error(`Failed to delete file: ${fileName}`);
      this.logger.error(err);
      return false;
    }
  }

  async generateTempLink(filename: string, limit: number = 60 * 60 * 24) {
    const fileName = 'contracts/' + filename;

    this.logger.log(`Generating link share for file: ${fileName}`);

    const url = await this.minioClient.presignedGetObject(
      process.env.MINIO_BUCKET_NAME,
      fileName,
      limit,
    );

    return { url };
  }
}
