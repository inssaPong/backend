import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MainSocketModule } from './sockets/main.module';
import { LoginModule } from './login/login.module';
import { MypageModule } from './mypage/mypage.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { ChannelsModule } from './channels/channels.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtAuthGuard } from './login/jwt/jwt-auth.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import configuration from 'config/configuration';
import { LoginRepository } from './login/login.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        DOMAIN: Joi.string().default('http://localhost').required(),
        BACKEND_PORT: Joi.number().default(3000).required(),
        FT_UID: Joi.string().required(),
        FT_SECRET: Joi.string().required(),
        FT_REDIRECT_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME_LONG: Joi.number().default(86400),
        JWT_EXPIRATION_TIME_SHORT: Joi.number().default(180),
        MAIL_HOST: Joi.string().required(),
        MAIL_FROM: Joi.string().required(),
        MAIL_USER: Joi.string().required(),
        MAIL_PASS: Joi.string().required(),
        TWOFACTOR_EXPIRATION_TIME: Joi.number().default(180),
        POSTGRES_HOST: Joi.string().default('localhost').required(),
        POSTGRES_PORT: Joi.number().default(5432).required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB_NAME: Joi.string().required(),
      }),
    }),
    LoginModule,
    MypageModule,
    UsersModule,
    GamesModule,
    ChannelsModule,
    MainSocketModule,
    DatabaseModule,
    CacheModule.register({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoginRepository,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
