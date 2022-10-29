import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const user = req.user;
    if (user === undefined) {
      console.log('log: undefined user');
      return false;
    }
    const payload = { username: user.username, email: user.email };
    const access_token = this.jwtService.sign(payload);
    console.log('access_token: ', access_token);
    res.cookie('atk', access_token, {
      httpOnly: true,
      signed: true,
    });
    return true;
  }
}
