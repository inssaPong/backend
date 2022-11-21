import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-42';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42') {
  private readonly logger = new Logger(FtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('ft.uid'),
      clientSecret: configService.get<string>('ft.secret'),
      callbackURL: configService.get<string>('ft.redirect_url'),
      profileFields: {
        username: 'login',
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
    const user = {
      id: profile.username,
      email: profile.email,
    };
    this.logger.debug(`id: ${user.id}, email: ${user.email}`);
    return cb(null, user);
  }
}
