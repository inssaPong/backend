import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtSignGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user;
    if (user === undefined) {
      Logger.log('Undefined user'); // Logger.log
      return false;
    }
    const payload = { username: user.username, email: user.email };
    const access_token = this.jwtService.sign(payload);
    Logger.debug(`access_token:  ${access_token}`); // Logger.debug
    response.cookie('Authorization', access_token, {
      httpOnly: true,
      // signed: true, // TODO: Encrypt cookie
    });
    return true;
  }
}
