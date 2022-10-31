import { LoginRepository } from './login.repository';
import {
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FtAuthGuard } from './ft_oauth/ft.guard';
import { JwtSignGuard } from './jwt/jwt_sign.guard';
import { LoginService } from './login.service';
import { Public } from './public.decorator';

// 1-1, 1-2, 1-3, 1-4
@Controller('/api/login')
@ApiTags('로그인 API')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly loginRepository: LoginRepository,
  ) {}

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
  // req : (body)nickname, (body)avatar
  // res : status code(성공 : 200, 실패 : 400)
  //   @Post('/newaccount') // TODO 원래 이거임.
  @Get('/newaccount')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'req : nickname, avatar \
              res : status code(성공 : 200, 실패 : 400)',
  })
  @Post('/newaccount')
  @HttpCode(200)
  @Header('access-control-allow-origin', '*')
  registerAccount(@Query('id') id: string) {
    console.log('in new account');
    this.loginRepository.createUser('sanjeon', 'SangHwan', 'sanjeon@naver.com');
    return 200;
  }

  // 2차 인증 로그인 성공 여부
  // req : (body)certified number
  // res : status code(성공 : 200, 실패 : 400)
  @ApiOperation({
    summary:
      'req : certificate number\
				        res : status code(성공 : 200, 실패 : 400)',
  })
  @Post('/certificate')
  @HttpCode(200)
  @Header('access-control-allow-origin', '*')
  checkTwoFactor(@Query('id') id: string) {
    return 200;
  }
}
