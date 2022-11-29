import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { FtUserDto } from 'src/login/dto/login.dto';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  logger = new Logger(MailService.name);

  async sendMail(user: FtUserDto): Promise<void> {
    const userId = user.id;
    const email = user.email;
    try {
      const certificationNumber = Math.random().toString(36).substring(2);
      this.logger.debug(`email: ${email}`);
      this.logger.debug(`certified number: ${certificationNumber}`);
      const mailOptions = {
        to: email,
        subject: '인증 번호 요청 메일',
        html: '인증 코드: ' + `<b> ${certificationNumber} </b>`,
      };
      await this.cacheManager.set(
        `${userId}_twofactor`,
        certificationNumber,
        this.configService.get<number>('twofactor.expiration_time'),
      );
      await this.mailerService.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async isValidCertificationNumber(
    user_id,
    input_number: string,
  ): Promise<boolean> {
    const certificationNumber = await this.cacheManager.get(
      `${user_id}_twofactor`,
    );
    if (certificationNumber !== input_number) {
      return false;
    }
    return true;
  }
}
