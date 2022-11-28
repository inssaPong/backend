import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
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
import { JwtSignupAuthGuard } from './jwt/jwt-signup-auth.guard';

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
  @Header('Access-Control-Allow-Credentials', 'true')
  @Header('Access-Control-Allow-Origin', 'http://localhost:8080')
  @Put('/twofactor')
  async confirmCertificationNumber(
    @User() user: FtUserDto,
    @Req() req,
    @Res() res,
  ) {
    await this.loginService.confirmCertificationNumber(
      user.id,
      req.body.CertificationNumber,
    );
    const accessToken = this.loginService.getAuthenticatedAccessToken(user);
    res.cookie('Authorization', accessToken);
    res.status(200).send();
  }

  @ApiOperation({ summary: 'editprofile 입장 유효성 검사' })
  @ApiOkResponse({ description: '[OK] 회원 가입이 필요한 유저' })
  @ApiForbiddenResponse({
    description: '[Forbidden] 이미 DB에 존재하는 유저',
  })
  @Public()
  @UseGuards(JwtSignupAuthGuard)
  @Get('/first') // TODO: 수정. 이름 변경
  async authEditProfile(@User() user_info: FtUserDto) {
    this.logger.log(`GET /login/first`);
    if (user_info.isRegistered === true) {
      throw new ForbiddenException();
    }
  }

  @ApiOperation({ summary: '최초 로그인 시 signup' })
  @ApiBody({ type: RequestEditProfileDto })
  @ApiOkResponse({ description: '회원가입 성공' })
  @ApiInternalServerErrorResponse({ description: 'DB에서 에러 반환' })
  @Public()
  @UseGuards(JwtSignupAuthGuard)
  @Header('Access-Control-Allow-Credentials', 'true')
  @Header('Access-Control-Allow-Origin', 'http://localhost:8080')
  @Post('/signup')
  async editProfile(@User() user: FtUserDto, @Res() res, @Body() body) {
    this.logger.log(`Post /login/signup`);
    await this.loginService.signUp(user, body);
    const accessToken = this.loginService.getAuthenticatedAccessToken(user);
    res.cookie('Authorization', accessToken);
    res.status(200).send();
  }
}
