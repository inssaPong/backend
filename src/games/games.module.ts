import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MainSocketModule } from 'src/sockets/main.module';
import { GameGateway } from './games.gateway';
import { GamesRepository } from './games.repository';

@Module({
  imports: [DatabaseModule, MainSocketModule],
  providers: [GameGateway, GamesRepository],
})
export class GamesModule {}
