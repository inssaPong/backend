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
  private readonly logger = new Logger(JwtSignGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly loginRepository: LoginRepository,
    private mainGateway: MainGateway,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const user = req.user;
    if (user === undefined) {
      this.logger.log('Undefined user');
      return false;
    }
    const access_token = this.jwtService.sign(user);
    this.logger.debug(`access_token:  ${access_token}`);
    res.cookie('Authorization', access_token, {
      // httpOnly: true, // TODO: true일때 보안은 좋으나 클라이언트에서 접근 불가. 어떻게 하지?
    });
    const is_signup = await this.loginRepository.findUser(user.id);
    if (is_signup === undefined) {
      this.logger.log('User does not exist in DB.');
      this.loginRepository.insertUser(user.id, user.id, user.email);
      res.redirect('http://localhost:8080/firstlogin');
      // socket용 user 객체 생성함
      this.mainGateway.newUser(user.id);
      this.logger.log(`user id: ${user.id}`);
    } else {
      this.logger.log('User is in DB.');
      res.redirect('http://localhost:8080/home');
    }
    return true;
  }
}
