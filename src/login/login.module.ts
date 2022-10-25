import { Module } from '@nestjs/common';
import { FtStrategy } from './ft.strategy';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';

@Module({
  controllers: [LoginController],
  providers: [LoginService, FtStrategy],
})
export class LoginModule {}
