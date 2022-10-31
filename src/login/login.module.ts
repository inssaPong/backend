import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginRepository } from './login.repository';
import { LoginService } from './login.service';

@Module({
  controllers: [LoginController],
  providers: [LoginService, LoginRepository],
})
export class LoginModule {}
