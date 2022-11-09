import { Module } from '@nestjs/common';
import { MainSocketModule } from 'src/sockets/main.module';
import { GamesController } from './games.controller';
import { GameGateway } from './games.gateway';
import { GamesService } from './games.service';

@Module({
  imports: [MainSocketModule],
  controllers: [GamesController],
  providers: [GamesService, GameGateway],
})
export class GamesModule {}
