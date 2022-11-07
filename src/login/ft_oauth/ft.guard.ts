import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FtAuthGuard extends AuthGuard('42') {
  async canActivate(host: ExecutionContext): Promise<boolean> {
    const activate: boolean = (await super.canActivate(host)) as boolean;
    return activate;
  }
}
