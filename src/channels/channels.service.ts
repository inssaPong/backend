import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ChannelsService {
  private readonly logger: Logger = new Logger(ChannelsService.name);
}
