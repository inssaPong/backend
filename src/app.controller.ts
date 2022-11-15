import { Controller, Get, Logger, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './login/public.decorator';

// 2-1
@Controller('')
export class AppController {
  private readonly logger: Logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  // 게임 페이지 깡통 get()
  @Get('/loginCheck')
  loginCheckGet(@Req() req, @Res() res) {
    const user_id = req.user.id;
    res.status(200).send('seungoh');
    return;
  }
}
