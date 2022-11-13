import { Controller, Get, Logger, Req } from '@nestjs/common';
import { AppService } from './app.service';

// 2-1
@Controller('')
export class AppController {
  private readonly logger: Logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  // 게임 페이지 깡통 get()
  @Get('/loginCheck')
  loginCheckGet(@Req() req) {
    const user_id = req.user.id;
    return user_id;
  }
}
