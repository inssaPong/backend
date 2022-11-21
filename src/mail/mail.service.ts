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

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  logger = new Logger(MailService.name);

  async sendMail(user_id: string, email: string) {
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
        `${user_id}_twofactor`,
        certificationNumber,
        this.configService.get<number>('twofactor.expiration_time'),
      );
      await this.mailerService.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async confirmCertificationNumber(user_id: string, input_number: string) {
    try {
      const certificationNumber = await this.cacheManager.get(
        `${user_id}_twofactor`,
      );
      if (certificationNumber !== input_number) {
        throw new BadRequestException('Secondary authentication failed');
      }
      this.logger.log('Secondary Authentication Successful');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
