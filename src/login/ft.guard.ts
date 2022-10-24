import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FtAuthGuard extends AuthGuard('42') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activate: boolean = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();

    // 사용자가 세션을 얻는 방법
    // AuthGuard가 가지고 있지만 사용하지 않기 때문에 FtAuthGuard를 만들어서 사용
    await super.logIn(request);
    return activate;
  }
}
