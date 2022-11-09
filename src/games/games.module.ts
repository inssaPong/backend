import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MainGateway } from 'src/sockets/main.gateway';
import { GamesController } from './games.controller';
import { GameGateway } from './games.gateway';
import { GamesRepository } from './games.repository';
import { GamesService } from './games.service';

@Module({
  imports: [DatabaseModule],
  controllers: [GamesController],
  providers: [GamesService, MainGateway, GameGateway, GamesRepository],
})
export class GamesModule {}
