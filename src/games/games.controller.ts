import { Controller, Get, Query, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GamesService } from './games.service';

// 3-1, 3-2
@Controller('/games')
@ApiTags('게임 API')
export class GamesController {
  private readonly logger: Logger = new Logger(GamesController.name);
  constructor(private readonly gameService: GamesService) {}
  
  // 게임 초대
  // req: 상대방 id
  // res: 상태코드(200, 404)
  @Get('/invite')
  @HttpCode(200)
  @ApiOperation({ summary: 'req : 상대방 id, res : 상태코드(200, 404)' })
  f4(@Query('id') id: string) {
    return 200;
  }
}
