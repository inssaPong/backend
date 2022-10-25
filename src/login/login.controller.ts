import { Controller, Header, HttpCode, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginService } from './login.service';

// 1-1, 1-2, 1-3, 1-4
@Controller('/login')
@ApiTags('로그인 API')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}
  // 계정 등록
  // req : user id, (body)nickname, (body)avatar
  // res : status code(성공 : 200, 실패 : 400)
  @Post('/newaccount')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'req : user id, nickname \
              res : status code(성공 : 200, 실패 : 400)',
  })
  @Header('access-control-allow-origin', '*')
  f1(@Query('id') id: string) {
    return 200;
  }

  // 이차 인증 로그인 성공 여부
  // req : user id, (body)certified number
  // res : status code(성공 : 200, 실패 : 400)
  @Post('/certificate')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'req : user id, certificate number\
				        res : status code(성공 : 200, 실패 : 400)',
  })
  @Header('access-control-allow-origin', '*')
  f2(@Query('id') id: string) {
    return 200;
  }
}
