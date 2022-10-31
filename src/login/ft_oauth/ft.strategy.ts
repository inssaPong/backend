import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-42';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('ft.UID'),
      clientSecret: configService.get<string>('ft.SECRET'),
      callbackURL: configService.get<string>('ft.REDIRECT_URL'),
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
    Logger.debug(`42 access Token: ${accessToken} `); // Logger.log
    Logger.debug(`42 refreshToken: ${refreshToken}`); // Logger.log
    const user = { username: profile.username, email: profile.email };
    return cb(null, user);
  }
}
