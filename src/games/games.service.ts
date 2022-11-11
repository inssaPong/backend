import { Injectable, Logger } from '@nestjs/common';
import { GamesRepository } from './games.repository';

@Injectable()
export class GamesService {
  private readonly logger: Logger = new Logger(GamesService.name);
  constructor(private readonly gamesRepository: GamesRepository) {}
}
