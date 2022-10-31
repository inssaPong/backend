import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

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
    // Logger.debug(`err: ${err}`); // Logger.debug
    // Logger.debug(`user: ${user}`); // Logger.debug
    // Logger.debug(`info: ${info}`); // Logger.debug
    // Logger.debug(`context: ${context}`); // Logger.debug
    // Logger.debug(`status: ${status}`); // Logger.debug
    if (info) Logger.log(`${info}`);
    if (err || !user) {
      Logger.log('Unauthorized users'); // Logger.log
      throw err || new UnauthorizedException();
    }
    Logger.log('Authorized user');
    return user;
  }
}
