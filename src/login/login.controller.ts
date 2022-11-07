import {
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FtAuthGuard } from './ft_oauth/ft.guard';
import { JwtSignGuard } from './jwt/jwt-signup.guard';
import { Public } from './public.decorator';
import { TwoFactorDto } from './dto/swagger-login.dto';
import { MailService } from 'src/mail/mail.service';

// 1-1, 1-2, 1-3, 1-4
@Controller('/login')
@ApiTags('로그인 API')
export class LoginController {
  constructor(private readonly mailService: MailService) {}

  logger: Logger = new Logger(LoginController.name);

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

  @ApiOperation({
    summary: '2차 인증 메일 전송',
    description: '본인 intra 이메일로 전송됨',
  })
  @Get('/twofactor')
  async sendTwoFactorMail(@Req() req) {
    const user_email = req.user.email;
    await this.mailService.sendMail(user_email);
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
  @Post('/twofactor')
  async confirmCertificationNumber(@Req() req, @Res() res) {
    const user_input_number = req.body.CertificationNumber;
    const status = await this.mailService.confirmCertificationNumber(
      user_input_number,
    );
    if (status === true) {
      this.logger.log('Secondary Authentication Successful');
      res.status(200).send();
    } else {
      this.logger.log('Secondary authentication failed');
      res.status(400).send();
    }
  }
}
