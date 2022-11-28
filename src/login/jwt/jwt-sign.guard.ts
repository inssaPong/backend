import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MainGateway } from 'src/sockets/main.gateway';

@Injectable()
export class JwtSignGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private mainGateway: MainGateway,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(JwtSignGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log(`[${context.getHandler().name}] -> [canActivate]`);
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    // Description: 유저가 존재하지 않을 때
    const user = req.user;
    this.logger.debug(user);
    if (user === undefined) {
      this.logger.log('Undefined user');
      return false;
    }

    const referer = 'http://localhost:8080';
    if (user.isAuthenticated === true) {
      // Description: 로그인 성공 시 유효기간이 긴 jwt 토큰 발급
      const loginAccessToken = this.jwtService.sign(user);
      this.logger.log(`'${user.id}': 로그인을 성공`);
      res.cookie('Authorization', loginAccessToken);
      res.redirect(`${referer}/home`);
      return true;
    }

    // Description: 로그인 절차가 남았을 때 유효기간이 짧은 jwt 토큰 발급(2차 인증, 회원 가입)
    const preLoginAcessToken = this.jwtService.sign(user, {
      expiresIn: this.configService.get<string>('jwt.expiration_time_short'),
    });
    if (user.twoFactorStatus === true) {
      this.logger.log(`'${user.id}': 2차 인증이 필요합니다.`);
      res.cookie('Authorization', preLoginAcessToken);
      res.redirect(`${referer}/twofactor`);
    } else if (user.isRegistered === false) {
      this.logger.log(`'${user.id}: '유저 등록이 필요합니다. signup로 이동`);
      res.cookie('Authorization', preLoginAcessToken);
      res.redirect(`${referer}/signup`);
    }
  }
}
