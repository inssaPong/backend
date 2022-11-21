import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import e from 'express';
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
    if (info) {
      this.logger.log(`info: ${info}`);
    }
    if (status) {
      this.logger.log(`status: ${status}`);
    }
    if (err || !user) {
      this.logger.error(`${err}`);
      throw err;
    }
    this.logger.log(`${user.id}는 인가된 유저입니다.`);
    return user;
  }
}
