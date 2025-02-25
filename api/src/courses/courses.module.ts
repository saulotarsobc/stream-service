import { Module } from '@nestjs/common';
import { MinioModule } from 'src/minio/minio.module';
import { NotifyModule } from 'src/notify/notify.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [PrismaModule, NotifyModule,MinioModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [],
})
export class CoursesModule {}
