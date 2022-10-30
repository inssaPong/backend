import {
  ExecutionContext,
  Injectable,
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

  handleRequest(err: any, user: any, info: any) {
    console.log('[DEBUG] err: ', err); // TODO: DEBUG
    console.log('[DEBUG] user: ', user); // TODO: DEBUG
    console.log('[DEBUG] info: ', info); // TODO: DEBUG
    if (err || !user) {
      console.log('[LOG] Unauthorized users'); // TODO: LOG
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
