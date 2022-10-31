import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FtStrategy } from './ft_oauth/ft.strategy';
import { LoginController } from './login.controller';
import { LoginRepository } from './login.repository';
import { LoginService } from './login.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, FtStrategy, JwtStrategy, LoginRepository],
})
export class LoginModule {}
