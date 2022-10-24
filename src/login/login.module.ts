import { Module } from '@nestjs/common';
import { FtStrategy } from './ft.strategy';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { SessionSerializer } from './session.serializer';

@Module({
  controllers: [LoginController],
  providers: [LoginService, FtStrategy, SessionSerializer]
})
export class LoginModule {}
