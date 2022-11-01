import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any) {
    /*
      TODO: DB에 해당 user가 있는지 확인
      ex)
      const has_user = userRepository.findOne(payload.username);
      if (!has_user) {
        Logger.log("유저 정보가 없습니다."); // Logger.log
        return undefined
      };
    */
    Logger.debug(`username: ${payload.username}`); // Logger.debug
    Logger.debug(`email: ${payload.email}`); // Logger.debug
    return { username: payload.username, email: payload.email };
  }
}
