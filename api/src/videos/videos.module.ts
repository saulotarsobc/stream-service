import { Module } from '@nestjs/common';
import { MinioModule } from 'src/minio/minio.module';
import { NotifyModule } from 'src/notify/notify.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';

@Module({
  imports: [PrismaModule, NotifyModule, MinioModule],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [],
})
export class VideosModule {}
