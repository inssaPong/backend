import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// providing additional details about the current execution process
@Injectable()
export class FtAuthGuard extends AuthGuard('42') {
  async canActivate(host: ExecutionContext): Promise<boolean> {
    const activate: boolean = (await super.canActivate(host)) as boolean;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // console.log('# Requests\n', request);
    // console.log('# Response\n', response);
    return activate;
  }
}
