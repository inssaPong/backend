import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-42';
import { FtUserDto } from '../dto/login.dto';
import { LoginRepository } from '../login.repository';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42') {
  private readonly logger = new Logger(FtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly loginRepository: LoginRepository,
  ) {
    super({
      clientID: configService.get<string>('ft.uid'),
      clientSecret: configService.get<string>('ft.secret'),
      callbackURL: configService.get<string>('ft.redirect_url'),
      profileFields: {
        id: 'login',
        email: 'email',
      },
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: VerifyCallback,
  ): Promise<any> {
    this.logger.log('[validate]');
    const isUserExist: boolean = await this.loginRepository.isUserExistInDB(
      profile.id,
    );
    let twoFactorStatus = false;

    if (isUserExist === true) {
      twoFactorStatus = await this.loginRepository.getTwoFactorStatusByUserId(
        profile.id,
      );
    }

    let isAuthenticated = true;
    if (twoFactorStatus === true || isUserExist === false) {
      isAuthenticated = false;
    }

    const user: FtUserDto = {
      id: profile.id,
      email: profile.email,
      isUserExist,
      twoFactorStatus,
      isAuthenticated,
    };
    return cb(null, user);
  }
}
