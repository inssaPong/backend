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
  @Get('/app')
  appPageGet(@Req() req) {
    const user_id = req.user.username;
    return user_id;
  }

  // 게임 페이지 깡통 get()
  @Get('/home')
  homePageGet(@Req() req) {
    const user_id = req.user.username;
    return user_id;
  }

  // 게임 페이지 깡통 get()
  @Get('/game')
  gamePageGet(@Req() req) {
    const user_id = req.user.username;
    return user_id;
  }
}
