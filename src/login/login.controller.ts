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
import { JwtAuthGuard } from './jwt/jwt.guard';
import { LoginService } from './login.service';

// 1-1, 1-2, 1-3, 1-4
@Controller('/login')
@ApiTags('로그인 API')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @UseGuards(FtAuthGuard)
  @Get('42')
  async ftLogin(@Req() req) {
    return;
  }

  @UseGuards(FtAuthGuard, JwtAuthGuard)
  @Get('42/callback')
  @Redirect('/') // TODO: 제거. 테스트 코드
  async ftAuthRedirect(@Req() req, @Res() res) {
    return;
  }

  // 계정 등록
  // req : (body)user id, (body)nickname, (body)avatar
  // res : status code(성공 : 200, 실패 : 400)
  // @UseGuards(JwtAuthGuard)
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
  // @UseGuards(JwtAuthGuard)
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
