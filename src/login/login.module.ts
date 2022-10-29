import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './jwt/jwt.constants';
import { FtStrategy } from './ft_oauth/ft.strategy';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: 3600,
      },
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, FtStrategy, JwtStrategy],
})
export class LoginModule {}
