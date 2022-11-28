import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { MainGateway } from 'src/sockets/main.gateway';
import { FtUserDto } from './dto/login.dto';
import { LoginRepository } from './login.repository';
import { User } from './user.decorator';

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly loginRepository: LoginRepository,
    private readonly mainGateway: MainGateway,
  ) {}

  async sendTwoFactorMail(@User() user_info: FtUserDto): Promise<void> {
    await this.mailService.sendMail(user_info);
  }

  // Description: 2차 인증
  async confirmCertificationNumber(
    user_id: string,
    certification_number: string,
  ): Promise<void> {
    this.logger.log(`POST /login/twofactor`);

    // Description: 2차 인증 코드 유효성 검사
    const isSuccess = await this.mailService.isValidCertificationNumber(
      user_id,
      certification_number,
    );
    if (isSuccess === false) {
      this.logger.error('2차 인증에 실패했습니다.');
      throw new ForbiddenException();
    }
    this.logger.log('2차 인증에 성공했습니다.');
  }

  // TODO: 회원가입
  async signUp(user_info: FtUserDto, body): Promise<void> {
    const id = user_info.id;
    const email = user_info.email;
    const nickname = body.nickname;
    const avatar = body.avatar;

    // Description: DB에 유저 정보 저장
    await this.loginRepository.insertUserData(id, nickname, email, avatar);
    // socket용 객체 생성
    this.mainGateway.newUser(id);
  }

  getAuthenticatedAccessToken(user_info: FtUserDto) {
    ///////
    const test_user: FtUserDto = {
      id: user_info.id,
      email: user_info.email,
      isRegistered: user_info.isRegistered,
      twoFactorStatus: user_info.twoFactorStatus,
      isAuthenticated: user_info.isAuthenticated,
    };
    //////

    test_user.isAuthenticated = true;
    const accessToken = this.jwtService.sign(test_user);
    console.log(accessToken);
    return accessToken;
  }

  getExpiredToken(user_info: FtUserDto) {
    // user_info.isAuthenticated = false;
    // console.log(user_info);
    // const expiredToken = this.jwtService.sign(user_info, {
    //   expiresIn: 0,
    // });
    return ``;
  }
}
