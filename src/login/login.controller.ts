import {
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FtAuthGuard } from './ft_oauth/ft.guard';
import { JwtSignGuard } from './jwt/jwt_sign.guard';
import { LoginService } from './login.service';
import { Public } from './public.decorator';

// 1-1, 1-2, 1-3, 1-4
@Controller('/login')
@ApiTags('로그인 API')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Public()
  @UseGuards(FtAuthGuard)
  @Get('42')
  async ftLogin() {
    return;
  }

  @Public()
  @UseGuards(FtAuthGuard, JwtSignGuard)
  @Get('42/callback')
  @Redirect('/') // TODO: Test code
  async ftAuthRedirect() {
    return;
  }

  // 계정 등록
  // req : (body)user id, (body)nickname, (body)avatar
  // res : status code(성공 : 200, 실패 : 400)
  @Post('/newaccount')
  @ApiOperation({
    summary:
      'req : user id, nickname\
				  res : status code(성공 : 200, 실패 : 400)',
  })
  f1(@Query('id') id: string) {
    return Object.assign({});
  }

  // 2차 인증 로그인 성공 여부
  // req : (body)user id, (body)certified number
  // res : status code(성공 : 200, 실패 : 400)
  @Post('/certificate')
  @ApiOperation({
    summary:
      'req : user id, certificate number\
				  res : status code(성공 : 200, 실패 : 400)',
  })
  f2(@Query('id') id: string) {
    return Object.assign({});
  }
}
