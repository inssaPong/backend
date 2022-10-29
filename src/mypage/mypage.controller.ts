import {
  Controller,
  Get,
  Query,
  Patch,
  HttpCode,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MypageService } from './mypage.service';

// 2-2
@Controller('/mypage')
@ApiTags('마이페이지 API')
export class MypageController {
  constructor(private readonly mypageService: MypageService) {}

  // 정보 가져오기
  // req : user id
  // res : {nickname, avatar binary code, twoFactor 여부}
  @Get()
  @ApiOperation({
    summary:
      'req : user id, \
                res : {nickname, avatar binary code, twoFactor 여부}',
  })
  @Header('access-control-allow-origin', '*')
  f1(@Query('id') id: string) {
    return Object.assign({
      nickname: 'test_nickname',
      avatar: 'test_avatar_binary_code',
      two_factor: 'on',
    });
  }

  // avatar 수정
  // req : user id, (body)avatar binary code
  // res : status code(성공 : 200, 실패 : 400)
  @Patch('/avatar')
  @ApiOperation({
    summary:
      'req : user id, avatar binary code \
							  res : status code(성공 : 200, 실패 : 400)',
  })
  @Header('access-control-allow-origin', '*')
  @HttpCode(200)
  f2(@Query('id') id: string) {
    return 200;
  }

  // 닉네임 수정
  // req : user id, (body)nickname
  // res : status code(성공 : 200, 실패 : 400)
  @Patch('/nickname')
  @ApiOperation({
    summary:
      'req : user id, nickname \
                res : status code(성공 : 200, 실패 : 400)',
  })
  @HttpCode(200)
  @Header('access-control-allow-origin', '*')
  f3(@Query('id') id: string) {
    return 200;
  }

  // 2차 인증 여부 수정
  // req : user id, (body)twoFactor
  // res :
  @Patch('/twoFactor')
  @ApiOperation({ summary: 'req : user id res : ' })
  @Header('access-control-allow-origin', '*')
  f4(@Query('id') id: string) {
    return 1111;
  }

  // 친구 목록 가져오기
  // req : user id
  // res : follow ids[]
  @Get('/follows')
  @ApiOperation({ summary: 'req : user id, res : follows[]' })
  @Header('access-control-allow-origin', '*')
  f5(@Query('id') id: string) {
    const follows = ['test1', 'test2', 'test3', 'test4'];
    return follows;
  }

  // follow들의 현재 접속 상태 가져오기
  // req : user id
  // res : follows status
  @Get('/follows/status')
  @ApiOperation({ summary: 'req : user id, res : follows status' })
  @Header('access-control-allow-origin', '*')
  f6(@Query('id') id: string) {
    return Object.assign({
      dason: 'on',
      seungoh: 'on',
    });
  }

  // 게임 전적 가져오기
  // req : user id
  // res : {winner, loser}[5]
  @Get('/gameHistory')
  @ApiOperation({
    summary: 'req : user id, res : status code(성공: 200, 실패: 404)',
  })
  @Header('access-control-allow-origin', '*')
  f7(@Query('id') id: string) {
    const arr = [
      { winner: 'seungoh', loser: 'dason' },
      { winner: 'seungoh', loser: 'dason' },
      { winner: 'seungoh', loser: 'dason' },
    ];
    return arr;
  }

  // 게임 승패 가져오기
  // req : user id
  // res : wins, loses
  @Get('/gameStat')
  @ApiOperation({ summary: 'req : user id, res : wins, loses' })
  @Header('access-control-allow-origin', '*')
  f8(@Query('id') id: string) {
    return Object.assign({
      wins: 9999,
      lose: '123',
    });
  }
}
