import { Module } from '@nestjs/common';
import { MainGateway } from 'src/sockets/main.gateway';
import { GamesController } from './games.controller';
import { GameGateway } from './games.gateway';
import { GamesService } from './games.service';

@Module({
  controllers: [GamesController],
  providers: [GamesService, MainGateway, GameGateway],
})
export class GamesModule {}
