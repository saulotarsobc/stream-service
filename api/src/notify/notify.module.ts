import { Module } from '@nestjs/common';
import { NotifyGateway } from './notify.gateway';

@Module({
  providers: [NotifyGateway],
  exports: [NotifyGateway],
})
export class NotifyModule {}
