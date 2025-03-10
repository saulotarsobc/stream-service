import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor() {}
}
