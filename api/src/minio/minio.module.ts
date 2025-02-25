import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestMinioModule } from "nestjs-minio";
import { MinioService } from "./minio.service";

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal: false,
     }),
    NestMinioModule.register({
      isGlobal: false,
      endPoint: process.env.MINIO_ENDPOINT,
      port: Number(process.env.MINIO_PORT),
      useSSL: process.env.MINIO_USE_SSL === "true",
      secretKey: process.env.MINIO_SECRET_KEY,
      accessKey: process.env.MINIO_ACCESS_KEY,
    }),
  ],
  providers: [MinioService],
  exports: [MinioService],
  controllers: [],
})
export class MinioModule {
  private readonly logger = new Logger(MinioModule.name);

  constructor() {
    if (
      !process.env.MINIO_ENDPOINT ||
      !process.env.MINIO_PORT ||
      !process.env.MINIO_USE_SSL ||
      !process.env.MINIO_SECRET_KEY ||
      !process.env.MINIO_ACCESS_KEY
    ) {
      throw new Error(
        "Please, define MINIO_ENDPOINT, MINIO_PORT, MINIO_USE_SSL, MINIO_SECRET_KEY and MINIO_ACCESS_KEY environment variables",
      );
    }
  }

  async onModuleInit() {
    this.logger.log("Minio module initialized");
  }
}