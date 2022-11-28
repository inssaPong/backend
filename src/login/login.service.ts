import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { FtUserDto, SignupDTO } from './dto/login.dto';
import { LoginRepository } from './login.repository';
import { User } from './user.decorator';

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly loginRepository: LoginRepository,
  ) {}

  async sendTwoFactorMail(user: FtUserDto): Promise<void> {
    await this.mailService.sendMail(user);
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
      this.logger.error(`${user_id}: 2차 인증에 실패했습니다.`);
      throw new ForbiddenException();
    }
    this.logger.log(`${user_id}: 2차 인증에 성공했습니다.`);
  }

  // TODO: 회원가입
  async signUp(user: FtUserDto, signup_data: SignupDTO): Promise<void> {
    const id = user.id;
    const email = user.email;
    const nickname = signup_data.nickname;
    const avatar = signup_data.avatar;

    // Description: DB에 유저 정보 저장
    await this.loginRepository.insertUserData(id, nickname, email, avatar);
  }

  getAuthenticatedAccessToken(user: FtUserDto) {
    const accessToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      isRegistered: true,
      twoFactorStatus: user.twoFactorStatus,
      isAuthenticated: true,
    });
    this.logger.log(`${user.id}: 로그인 성공`);
    return accessToken;
  }
}
