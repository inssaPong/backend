import {
  ExecutionContext,
  ForbiddenException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class JwtTwoFactorAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtTwoFactorAuthGuard.name);

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    console.log(user);
    this.logger.log(`[${context.getHandler().name}] -> [handleRequest]`);
    if (info) {
      this.logger.log(`info: ${info}`);
    }
    if (status) {
      this.logger.log(`status: ${status}`);
    }
    if (err || !user) {
      this.logger.error(`error: ${err}`);
      throw new UnauthorizedException();
    }

    // Description: 이미 인증에 성공한 유저가 접근 시도
    // home
    if (user.isAuthenticated === true) {
      throw new ForbiddenException();
    }

    // Description: DB에 존재하고 2차 인증이 꺼져있는 유저가 접근 시도. twofactor
    // home
    if (user.isRegistered === true && user.twoFactorStatus === false) {
      throw new ForbiddenException();
    }

    // Description: DB에 없는 유저가 접근 시도
    // home -> login
    if (user.isRegistered === false) {
      throw new ForbiddenException();
    }

    this.logger.log(`${user.id}: 추가 인증을 진행합니다.`);
    return user;
  }
}
