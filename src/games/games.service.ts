import { Injectable } from '@nestjs/common';
import { GamesRepository } from './games.repository';

@Injectable()
export class GamesService {
  constructor(private readonly gamesRepository: GamesRepository) {}
}
