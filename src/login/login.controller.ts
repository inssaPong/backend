import {
  Controller,
  ForbiddenException,
  Get,
  Logger,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FtAuthGuard } from './ft_oauth/ft.guard';
import { JwtSignGuard } from './jwt/jwt-sign.guard';
import { Public } from './public.decorator';
import { RequestBodyInputTwoFactorCodeDto } from './dto/swagger-login.dto';
import { User } from './user.decorator';
import { FtUserDto, RequestEditProfileDto } from './dto/login.dto';
import { JwtTwoFactorAuthGuard } from './jwt/jwt-twofactor-auth.guard';
import { LoginService } from './login.service';

// 1-1, 1-2, 1-3, 1-4
@Controller('/login')
@ApiTags('로그인 API')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  private readonly logger = new Logger(LoginController.name);

  @ApiOperation({ summary: '42 Oauth 로그인' })
  @Public()
  @UseGuards(FtAuthGuard)
  @Get('42')
  async ftLogin() {
    return;
  }

  @ApiOperation({ summary: '42 Oauth 로그인 콜백' })
  @Public()
  @UseGuards(FtAuthGuard, JwtSignGuard)
  @Get('42/callback')
  async ftCallback() {
    return;
  }

  @ApiOperation({
    summary: '2차 인증 유효성 검사 & 메일 전송',
    description: '본인 intra 이메일로 전송됨',
  })
  @Public()
  @UseGuards(JwtTwoFactorAuthGuard)
  @Get('/twofactor')
  async sendTwoFactorMail(@User() user_info: FtUserDto) {
    this.logger.log(`GET /login/twofactor`);
    await this.loginService.sendTwoFactorMail(user_info);
  }

  // 2차 인증 성공 여부
  @ApiOperation({ summary: '2차 인증 성공 여부' })
  @ApiBody({ type: RequestBodyInputTwoFactorCodeDto })
  @ApiOkResponse({ description: '[OK] 2차 인증 성공' })
  @ApiBadRequestResponse({ description: '[Bad Request] 2차 인증 실패' })
  @Public()
  @UseGuards(JwtTwoFactorAuthGuard)
  @Put('/twofactor')
  async confirmCertificationNumber(
    @User() user_info: FtUserDto,
    @Req() req,
    @Res() res,
  ) {
    await this.loginService.confirmCertificationNumber(
      user_info.id,
      req.body.CertificationNumber,
    );
    const accessToken =
      this.loginService.getAuthenticatedAccessToken(user_info);

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.cookie('Authorization', accessToken);

    res.status(200).send();
  }

  @ApiOperation({ summary: 'editprofile 입장 유효성 검사' })
  @ApiOkResponse({ description: '[OK] 회원 가입이 필요한 유저' })
  @ApiForbiddenResponse({
    description: '[Forbidden] 이미 DB에 존재하는 유저',
  })
  @Public()
  @UseGuards(JwtTwoFactorAuthGuard)
  @Get('/first')
  async authEditProfile(@User() user_info: FtUserDto, @Res() res) {
    this.logger.log(`GET /login/editprofile`);
    console.log(user_info);
    if (user_info.isUserExist === true) {
      throw new ForbiddenException();
    }
    res.status(200).send();
  }

  @ApiOperation({ summary: '최초 로그인 시 editprofile' })
  @ApiBody({ type: RequestEditProfileDto })
  @ApiOkResponse({ description: '회원가입 성공' })
  @ApiInternalServerErrorResponse({ description: 'DB에서 에러 반환' })
  @Public()
  @Post('/editprofile')
  async editProfile(@User() user_info: FtUserDto, @Req() req, @Res() res) {
    this.logger.log(`Post /login/editprofile`);
    await this.loginService.signUp(user_info);
    const accessToken =
      this.loginService.getAuthenticatedAccessToken(user_info);

    res.cookie('Authorization', accessToken);
    res.status(200).send();
  }

  @ApiOperation({ summary: '로그아웃' })
  @ApiOkResponse({ description: '로그아웃 성공' })
  @Get('/logout')
  async logOut(@User() user_info: FtUserDto, @Res() res) {
    const expiredToken = this.loginService.getExpiredToken(user_info);
    res.cookie('Authorization', expiredToken);
    res.status(200).send();
  }
}
