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
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Description: 유저가 존재하지 않을 때
    const userInfo = request.user;
    this.logger.debug(userInfo);
    if (userInfo === undefined) {
      this.logger.log('Undefined user');
      return false;
    }

    // Description: 로그인 성공 시 유효기간이 긴 jwt 토큰 발급
    const loginAccessToken = this.jwtService.sign(userInfo);

    // Description: 로그인 절차가 남았을 때 유효기간이 짧은 jwt 토큰 발급(2차 인증, 회원 가입)
    const preLoginAcessToken = this.jwtService.sign(userInfo, {
      expiresIn: this.configService.get<string>('jwt.expiration_time_short'),
    });
    const referer = 'http://localhost:8080';
    if (userInfo.isAuthenticated === true) {
      this.logger.log(`'${userInfo.id}': 로그인을 성공했습니다.`);
      response.cookie('Authorization', loginAccessToken);
      response.redirect(`${referer}/home`);
    } else if (userInfo.twoFactorStatus === true) {
      this.logger.log(`'${userInfo.id}': 2차 인증이 필요합니다.`);
      response.cookie('Authorization', preLoginAcessToken);
      response.redirect(`${referer}/twofactor`);
    } else if (userInfo.isUserExist === false) {
      this.logger.log(
        `'${userInfo.id}: '유저 등록이 필요합니다. editprofile로 이동`,
      );
      response.cookie('Authorization', preLoginAcessToken);
      response.redirect(`${referer}/editprofile`);
    }
  }
}
