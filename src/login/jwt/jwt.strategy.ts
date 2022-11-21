import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, Req, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginRepository } from '../login.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly loginRepository: LoginRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  private readonly logger = new Logger(JwtStrategy.name);

  async validate(payload: any) {
    this.logger.log(`[validate]`);
    this.logger.debug(`id: ${payload.id}, email: ${payload.email}`);

    // Description: DB 체크에 해당 유저가 있는지 검사
    try {
      const userData = await this.loginRepository.getUserData(payload.id);
      if (!userData) {
        throw new UnauthorizedException();
      }
      return { id: payload.id, email: payload.email };
    } catch (exception) {
      throw exception;
    }
  }
}
