import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-42';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    super({
      clientID:
        'u-s4t2ud-5e9fc00e39e3c71948befd0e309a2fc64257cec15a7d8a75ee708d5267ccba82',
      clientSecret:
        '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',
      callbackURL: '/login/42/callback',
      session: true,
      passReqToCallback: true, // Callback 함수로 req 전달. callback 함수에 req 매개변수 추가해야함
      profileFields: {
        username: 'login',
        'emails.0.value': 'email',
        'photos.0.value': 'image_url',
      },
    });
  }

  async validate(
    request: { session: { accessToken: string } },
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: VerifyCallback,
  ): Promise<any> {
    console.log('access Token ', accessToken);
    console.log('\nrefreshToken: ', refreshToken);
    console.log('\nprofile: ', profile);
    request.session.accessToken = accessToken;
    // const user = {
    // 	profile,
    // 	accessToken,
    // 	refreshToken
    // }
    return cb(null, profile);
  }
}
