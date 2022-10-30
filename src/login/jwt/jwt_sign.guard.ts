import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
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
      console.log('[LOG] Undefined user'); // TODO: LOG
      return false;
    }
    const payload = { username: user.username, email: user.email };
    const access_token = this.jwtService.sign(payload);
    console.log('[DEBUG] access_token: ', access_token); // TODO: DEBUG
    response.cookie('Authorization', access_token, {
      httpOnly: true,
      // signed: true, // TODO: Encrypt cookie
    });
    return true;
  }
}
