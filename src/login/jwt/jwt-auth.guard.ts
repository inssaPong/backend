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
      this.logger.log(`${info}`);
    }
    if (err || !user) {
      this.logger.log('Unauthorized users');
      throw new UnauthorizedException();
    }

    // Description: DB 체크에 해당 유저가 있는지 검사
    try {
      const userData = this.loginRepository.getUserData(user.id);
      if (!userData) {
        this.logger.log('Unauthorized users');
        throw new UnauthorizedException();
      }
    } catch (exception) {
      throw exception;
    }
    this.logger.log(`${user.id}는 인가된 유저입니다.`);
    return user;
  }
}
