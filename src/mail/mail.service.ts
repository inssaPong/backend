import { MailerService } from '@nestjs-modules/mailer';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  logger = new Logger(MailService.name);

  async sendMail(email: string) {
    try {
      const certification_number = Math.random().toString(36).substring(2);
      this.logger.debug(`email: ${email}`);
      this.logger.debug(`certified number: ${certification_number}`);
      const mailOptions = {
        to: email,
        subject: '인증 번호 요청 메일',
        html: '인증 코드: ' + `<b> ${certification_number} </b>`,
      };
      await this.cacheManager.set(
        'certification_number',
        certification_number,
        3600,
      );
      await this.mailerService.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async confirmCertificationNumber(input: string) {
    try {
      const certification_number = await this.cacheManager.get(
        'certification_number',
      );
      this.logger.debug(`input number: ${input}`);
      if (certification_number !== input) return false;
      else return true;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
