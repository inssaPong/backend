import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { LoginRepository } from '../login.repository';
import { IS_PUBLIC_KEY } from '../public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly loginRepository: LoginRepository,
  ) {
    super();
  }

  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    this.logger.log(`[${context.getHandler().name}] -> [canActivate]`);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
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
    if (err || !user || user.isAuthenticated === false) {
      this.logger.error(`error: ${err}`);
      throw new UnauthorizedException();
    }
    this.logger.log(`${user.id}: 인가 승인`);
    return user;
  }
}
