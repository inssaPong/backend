import { Module } from '@nestjs/common';
import { AppController, Channels, Games, Users } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './sockets/game.module';

@Module({
  imports: [EventsModule],
  controllers: [AppController, Users, Games, Channels],
  providers: [AppService],
})
export class AppModule {}
