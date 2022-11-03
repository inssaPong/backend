import { LoginRepository } from './login.repository';
import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FtAuthGuard } from './ft_oauth/ft.guard';
import { JwtSignGuard } from './jwt/jwt_signup.guard';
import { LoginService } from './login.service';
import { Public } from './public.decorator';
import { optional, string } from 'joi';
import { TwoFactorDto } from './dto/swagger-login.dto';

// 1-1, 1-2, 1-3, 1-4
@Controller('/login')
@ApiTags('로그인 API')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly loginRepository: LoginRepository,
  ) {}

  @ApiOperation({
    summary: '42 Oauth 로그인',
  })
  @Public()
  @UseGuards(FtAuthGuard)
  @Get('42')
  async ftLogin() {
    return;
  }

  @ApiOperation({
    summary: '42 Oauth 로그인 콜백',
    description: '직접적으로 사용하지 않음',
  })
  @Public()
  @UseGuards(FtAuthGuard, JwtSignGuard)
  @Get('42/callback')
  async ftAuthRedirect() {
    return;
  }

  // 2차 인증 성공 여부
  @ApiOperation({
    summary: '2차 인증 성공 여부',
  })
  @ApiBody({ type: TwoFactorDto })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Authentication failed',
  })
  @Post('/certificate')
  @HttpCode(200)
  checkTwoFactor() {
    return 200;
  }
}
