import { BullModule, InjectQueue } from '@nestjs/bull';
import { Module, RequestMethod } from '@nestjs/common';
import { MiddlewareBuilder } from '@nestjs/core';
import { Queue } from 'bull';
import { createBullBoard } from 'bull-board';
import { BullAdapter } from 'bull-board/bullAdapter';
import { QUEUES } from 'src/enums';
import { JobsProcessor } from './jobs.processor';
import { JobsService } from './jobs.service';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        // removeOnComplete: 50,
        // removeOnFail: 100,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
    BullModule.registerQueue({
      name: QUEUES.VIDEOS,
    }),
    BullModule.registerQueue({
      name: QUEUES.NOTIFICATIONS,
    }),
  ],
  providers: [JobsService, JobsProcessor],
})
export class JobsModule {
  constructor(
    @InjectQueue(QUEUES.VIDEOS) private videos: Queue,
    @InjectQueue(QUEUES.NOTIFICATIONS) private notifications: Queue,
  ) {}

  configure(consumer: MiddlewareBuilder) {
    const { router } = createBullBoard([
      new BullAdapter(this.videos),
      new BullAdapter(this.notifications),
    ]);

    // Middleware to check for a password
    const passwordMiddleware = (req, res, next) => {
      const auth = { login: 'admin', password: 'admin01' };

      const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
      const [login, password] = Buffer.from(b64auth, 'base64')
        .toString()
        .split(':');

      if (
        login &&
        password &&
        login === auth.login &&
        password === auth.password
      ) {
        return next();
      }

      res.set('WWW-Authenticate', 'Basic realm="401"');
      res.status(401).send('Authentication required.');
    };

    consumer.apply(passwordMiddleware, router).forRoutes('/bull', {
      path: 'bull',
      version: '1',
      method: RequestMethod.GET,
    });
  }
}
