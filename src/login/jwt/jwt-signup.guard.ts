import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MainGateway } from 'src/sockets/main.gateway';
import { LoginRepository } from '../login.repository';

@Injectable()
export class JwtSignGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly loginRepository: LoginRepository,
    private mainGateway: MainGateway,
  ) {}

  private readonly logger = new Logger(JwtSignGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const user = req.user;
    // const referer = req.headers.referer;
    const referer = 'http://localhost:8080/';
    if (user === undefined) {
      this.logger.log('Undefined user');
      return false;
    }
    const access_token = this.jwtService.sign(user);
    this.logger.debug(`access_token:  ${access_token}`);
    res.cookie('Authorization', access_token, {
      // httpOnly: true, // TODO: true일때 보안은 좋으나 클라이언트에서 접근 불가. 어떻게 하지?
    });

    try {
      const userData = await this.loginRepository.getUserDataInUser(user.id);
      if (userData === undefined) {
        // Description: 해당 유저가 DB에 존재하지 않을 때
        this.logger.log('User does not exist in DB.');
        this.loginRepository.insertUserDataInUser(user.id, user.id, user.email);
        res.redirect(`${referer}editprofile`);
        // socket용 user 객체 생성함
        this.mainGateway.newUser(user.id);
      } else {
        // Description: 해당 유저가 DB에 존재할 때
        this.logger.log('User is in DB.');
        if (userData.twofactor === true) {
          res.redirect(`${referer}login/twofactor`);
        } else {
          res.redirect(`${referer}home`);
        }
      }
      return true;
    } catch (exception) {
      throw exception;
    }
  }
}
