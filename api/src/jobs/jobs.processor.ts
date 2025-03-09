import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { JOB_NAMES, QUEUES } from './enums';

@Processor(QUEUES.VIDEOS)
export class JobsProcessor {
  private readonly logger = new Logger(JobsProcessor.name);

  @Process(JOB_NAMES.VIDEO_UPLOADED)
  async handleJob(job: Job<any>): Promise<void> {
    this.logger.warn(job.id);
    await job.progress(100);
  }
}
