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
import * as Joi from 'joi';
import { JwtAuthGuard } from './login/jwt/jwt.guard';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import configuration from 'config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        port: Joi.number().default(3000),
        ft_uid: Joi.string(),
        ft_secret: Joi.string(),
        ft_redirect_url: Joi.string(),
        jwt_secret: Joi.string(),
        cookie_secret: Joi.string(),
        jwt_expiration_time: Joi.number().default(3600),
        postgres_host: Joi.string(),
        postgres_port: Joi.number(),
        postgres_user: Joi.string(),
        postgres_password: Joi.string(),
        postgres_name: Joi.string(),
      }),
    }),
    LoginModule,
    MypageModule,
    UsersModule,
    GamesModule,
    ChannelsModule,
    EventsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule {}
