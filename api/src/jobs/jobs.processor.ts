import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { JOB_NAMES, QUEUES } from 'src/enums';

@Processor(QUEUES.VIDEOS)
export class JobsProcessor {
  private readonly logger = new Logger(JobsProcessor.name);

  @Process({
    name: JOB_NAMES.VIDEO_UPLOADED,
    concurrency: 1,
  })
  async handleJob(job: Job<any>): Promise<void> {
    this.logger.debug('Job with id ' + job.id + ' processed');
  }
}
