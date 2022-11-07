import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-42';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private configService: ConfigService) {
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
    const logger = new Logger(FtStrategy.name);
    logger.debug(`42 access Token: ${accessToken} `);
    logger.debug(`42 refreshToken: ${refreshToken}`);
    const user = {
      username: profile.username,
      email: profile.email,
    };
    return cb(null, user);
  }
}
