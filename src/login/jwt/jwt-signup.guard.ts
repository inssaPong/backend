import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MainGateway } from 'src/sockets/main.gateway';
import { MainSocketModule } from 'src/sockets/main.module';
import { LoginRepository } from '../login.repository';

@Injectable()
export class JwtSignGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly loginRepository: LoginRepository,
    private mainGateway: MainGateway,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const logger = new Logger('JwtSinupGuard');
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user;
    if (user === undefined) {
      logger.log('Undefined user');
      return false;
    }
    const payload = { username: user.username, email: user.email };
    const access_token = this.jwtService.sign(payload);
    logger.debug(`access_token:  ${access_token}`);
    response.cookie('Authorization', access_token, {
      // httpOnly: true, // TODO: true일때 보안은 좋으나 클라이언트에서 접근 불가. 어떻게 하지?
    });
    const is_signup = await this.loginRepository.findUser(user.username);
    if (is_signup === undefined) {
      logger.log('User does not exist in DB.');
      this.loginRepository.insertUser(user.username, user.username, user.email);
      response.redirect('http://localhost:8080/firstlogin');
      // socket용 user 객체 생성함
      this.mainGateway.newUser(user.username);
      console.log(user.username);
    } else {
      logger.log('User is in DB.');
      response.redirect('http://localhost:8080/home');
    }
    return true;
  }
}
