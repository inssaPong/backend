import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './sockets/main.module';
import { LoginModule } from './login/login.module';
import { MypageModule } from './mypage/mypage.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { ChannelsModule } from './channels/channels.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';
import * as Joi from 'joi';
import { JwtAuthGuard } from './login/jwt/jwt.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        FT_UID: Joi.string(),
        FT_SECRET: Joi.string(),
        FT_REDIRECT_URL: Joi.string(),
        JWT_SECRET: Joi.string(),
        COOKIE_SECRET: Joi.string(),
        JWT_EXPIRATION_TIME: Joi.number().default(3600),
      }),
    }),
    LoginModule,
    MypageModule,
    UsersModule,
    GamesModule,
    ChannelsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
