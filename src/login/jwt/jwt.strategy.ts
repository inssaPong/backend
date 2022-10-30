import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.SECRET'),
    });
  }

  async validate(payload: any) {
    /*
      TODO: DB에 해당 user가 있는지 확인
      ex)
      const has_user = userRepository.findOne(payload.username);
      if (!has_user) {
        console.log("[LOG] 유저 정보가 없습니다.");
        return undefined
      };
    */
    console.log('[DEBUG] username: ', payload.username); // TODO: DEBUG
    console.log('[DEBUG] email: ', payload.email); // TODO: DEBUG
    return { username: payload.username, email: payload.email };
  }
}
