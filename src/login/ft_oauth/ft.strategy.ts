import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-42';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('ft.UID'), // env config
      clientSecret: configService.get<string>('ft.SECRET'), // env config
      callbackURL: configService.get<string>('ft.REDIRECT_URL'), // env config
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
    console.log('42 access Token ', accessToken);
    console.log('\n42 refreshToken: ', refreshToken);
    const user = { username: profile.username, email: profile.email };
    return cb(null, user);
  }
}
