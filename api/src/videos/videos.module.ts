import { Module } from '@nestjs/common';
import { NotifyModule } from 'src/notify/notify.module';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';

@Module({
  imports: [NotifyModule],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
