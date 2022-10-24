import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './login/login.module';
import { MypageModule } from './mypage/mypage.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [
    LoginModule,
    MypageModule,
    UsersModule,
    GamesModule,
    ChannelsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
