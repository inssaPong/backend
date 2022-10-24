import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GamesService } from './games.service';

// 3-1, 3-2
@Controller('/games')
@ApiTags('게임 API')
export class GamesController {
  constructor(private readonly gameService: GamesService) {}

  // 매칭 중 첫 페이지 들어옴
  // req : id
  // res : id, nickname
  @Get()
  @ApiOperation({
    summary: 'req : id, \
                           res : id, nickname',
    description: 'req : id, \
                              res : id, nickname',
  })
  f1(@Param('id') id: string) {
    return Object.assign({
      id: `${id}`,
      nickname: `${id}`,
    });
  }

  // 게임 끝날 때
  // post
  // req: (body)승자 id, (body)패자 id
  // res: X. 상태코드 리다이렉트 홈페이지
  @Post()
  @ApiOperation({
    summary: 'req : 승자 id, 패자 id, \
                           res :',
    description: 'req : 승자 id, 패자 id, \
                              res :',
  })
  f2(@Param('id') id1: string, @Param('id2') id2: string) {
    return Object.assign({});
  }

  // 게임 관전
  // req: p1 id
  // res: p1 id, p1 nickname, p2 id, p2 nickname
  @Get('/watch')
  @ApiOperation({
    summary: 'req : p1 id, \
							 res : p1 id, p1 nickname, p2 id, p2 nickname',
    description:
      'req : p1 id, \
                              res :p1 id, p1 nickname, p2 id, p2 nickname',
  })
  f3(@Param('id') id: string) {
    return Object.assign({});
  }

  // 게임 초대
  // req: 상대방 id
  // res: 상태코드(200, 404)
  @Get('/invite')
  @ApiOperation({
    summary:
      'req : 상대방 id, \
                           res : 상태코드(200, 404)',
    description:
      'req : 상대방 id, \
                              res : 상태코드(200, 404)',
  })
  f4(@Param('id') id: string) {
    return Object.assign({});
  }
}
