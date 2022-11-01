import { Controller, Get, Query, Post, HttpCode, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GamesService } from './games.service';

// 3-1, 3-2
@Controller('/api/games')
@ApiTags('게임 API')
export class GamesController {
  constructor(private readonly gameService: GamesService) {}

  // 매칭 중 첫 페이지 들어옴
  // req : id
  // res : id, nickname
  @Get()
  @ApiOperation({ summary: 'req : id, res : id, nickname' })
  f1(@Query('id') id: string) {
    return Object.assign({
      id: `${id}`,
      nickname: `${id}`,
    });
  }

  // 게임 끝날 때
  // post
  // req: 승자 id, (body)패자 id
  // res: X. 상태코드 리다이렉트 홈페이지
  @Post()
  @ApiOperation({ summary: 'req : 승자 id, 패자 id, res :' })
  f2(@Query('id') id: string) {
    return 200;
  }

  // 게임 관전
  // req: p1 id
  // res: p1 id, p1 nickname, p2 id, p2 nickname
  @Get('/watch')
  @ApiOperation({
    summary:
      'req : p1 id, \
                res : p1 id, p1 nickname, p2 id, p2 nickname',
  })
  f3(@Query('id') id: string) {
    return Object.assign({
      p1_id: 'seungoh',
      p1_nickname: '짱짱',
      p2_id: 'dason',
      p2_nickname: 'bb',
    });
  }

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
