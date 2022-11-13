import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MainSocketModule } from 'src/sockets/main.module';
import { GamesController } from './games.controller';
import { GameGateway } from './games.gateway';
import { GamesRepository } from './games.repository';
import { GamesService } from './games.service';

@Module({
  imports: [DatabaseModule, MainSocketModule],
  controllers: [GamesController],
  providers: [GamesService, GameGateway, GamesRepository],
})
export class GamesModule {}
