import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FtStrategy } from './ft_oauth/ft.strategy';
import { LoginController } from './login.controller';
import { LoginRepository } from './login.repository';
import { JwtStrategy } from './jwt/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { MailModule } from '../mail/mail.module';
import { MainSocketModule } from 'src/sockets/main.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiration_time'),
        },
      }),
    }),
    ConfigModule,
    PassportModule,
    DatabaseModule,
    MailModule,
    MainSocketModule,
  ],
  controllers: [LoginController],
  providers: [FtStrategy, JwtStrategy, LoginRepository],
})
export class LoginModule {}
