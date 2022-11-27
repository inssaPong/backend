import {
  ExecutionContext,
  ForbiddenException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class JwtSignupAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtSignupAuthGuard.name);

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
    // Description: 이미 인증에 성공한 유저가 접근 시도. home
    if (user.isAuthenticated === true) {
      throw new ForbiddenException();
    }

    // Description: 위의 경우를 제외하고 DB에 존재하는 유저가 접근을 시도. signup
    if (user.isRegistered === true) {
      throw new ForbiddenException();
    }

    this.logger.log(`${user.id}: 계정 등록을 진행합니다`);
    return user;
  }
}
