import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './sockets/main.module';
import { LoginModule } from './login/login.module';
import { MypageModule } from './mypage/mypage.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { ChannelsModule } from './channels/channels.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    LoginModule,
    MypageModule,
    UsersModule,
    GamesModule,
    ChannelsModule,
    EventsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
