import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { DatabaseService } from 'src/database/database.service';
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
    const res = context.switchToHttp().getResponse();
    if (info) {
      this.logger.log(`${info}`);
    }
    if (err || !user) {
      this.logger.log('Unauthorized users');
      res.redirect('http://localhost:8080');
      throw err || new UnauthorizedException();
    }

    // Description: DB 체크에 해당 유저가 있는지 검사
    try {
      const has_user = this.loginRepository.findUser(user.id);
      if (!has_user) {
        this.logger.log('Unauthorized users');
        res.redirect('http://localhost:8080');
        throw err || new UnauthorizedException();
      }
    } catch (error) {
      this.logger.error(error);
      res.redirect('http://localhost:8080');
      throw err || new UnauthorizedException();
    }
    this.logger.log(`Authorized user: ${user.id}`);
    return user;
  }
}
