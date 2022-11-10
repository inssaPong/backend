import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';

// 2-1
@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  home() {
    return 'home';
  }

  // 게임 페이지 깡통 get()
  @Get('/loginCheck')
  loginCheckGet(@Req() req) {
    const user_id = req.user.id;
    return user_id;
  }
}
