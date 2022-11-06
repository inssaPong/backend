import { CacheModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FtStrategy } from './ft_oauth/ft.strategy';
import { LoginController } from './login.controller';
import { LoginRepository } from './login.repository';
import { LoginService } from './login.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { MailModule } from '../mail/mail.module';

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
  ],
  controllers: [LoginController],
  providers: [LoginService, FtStrategy, JwtStrategy, LoginRepository],
})
export class LoginModule {}
