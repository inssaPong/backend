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

    if (user.isAuthenticated === true) {
      throw new ForbiddenException();
    }

    if (user.isRegistered === true) {
      throw new ForbiddenException();
    }

    this.logger.log(`${user.id}: 계정 등록을 진행합니다`);
    return user;
  }
}
