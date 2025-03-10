import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { JOB_NAMES, QUEUES } from 'src/enums';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(@InjectQueue(QUEUES.VIDEOS) private readonly queue: Queue) {}

  async addVideoUploaded(data: any): Promise<void> {
    this.logger.log('Adding video uploaded job to queue');
    await this.queue.add(JOB_NAMES.VIDEO_UPLOADED, data);
  }

  onModuleInit() {
    // setInterval(async () => {
    //   this.addJob({ message: 'Hello, World!' }).then(() => {
    //     this.logger.debug('Job added to queue');
    //   });
    // }, 1000);
  }
}
