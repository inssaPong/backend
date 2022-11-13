import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any) {
<<<<<<< HEAD
    const logger = new Logger(JwtStrategy.name);
    logger.debug(`username: ${payload.username}`);
    logger.debug(`email: ${payload.email}`);
    return { username: payload.username, email: payload.email };
=======
    this.logger.debug(`id: ${payload.id}, email: ${payload.email}`);
    return { id: payload.id, email: payload.email };
>>>>>>> main
  }
}
