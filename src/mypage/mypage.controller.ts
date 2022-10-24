import { Controller, Get, Param, Patch } from '@nestjs/common';
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
  f1(@Param('id') id: string) {
    return Object.assign({});
  }

  // avatar 수정
  // req : (body)user id, (body)avatar binary code
  // res : status code(성공 : 200, 실패 : 400)
  @Patch('/avatar')
  @ApiOperation({
    summary:
      'req : user id, avatar binary code \
							res : status code(성공 : 200, 실패 : 400)',
  })
  f2(@Param('id') id: string) {
    return Object.assign({});
  }

  // 닉네임 수정
  // req : (body)user id, (body)nickname
  // res : status code(성공 : 200, 실패 : 400)
  @Patch('/nickname')
  @ApiOperation({
    summary:
      'req : user id, nickname\
							res : status code(성공 : 200, 실패 : 400)',
  })
  f3(@Param('id') id: string) {
    return Object.assign({});
  }

  // 2차 인증 여부 수정
  // req : (body)user id, (body)twoFactor
  // res :
  @Patch('/twoFactor')
  @ApiOperation({ summary: 'req : user id\
							res : ' })
  f4(@Param('id') id: string) {
    return Object.assign({});
  }

  // 친구 목록 가져오기
  // req : user id
  // res : follow ids[]
  @Get('/follows')
  @ApiOperation({ summary: 'req : user id, \
							res : follows[]' })
  f5(@Param('id') id: string) {
    return Object.assign({});
  }

  // follow의 현재 접속 상태 가져오기
  // req : user id
  // res : user status
  @Get('/follows/status')
  @ApiOperation({ summary: 'req : user id, \
							res : user status' })
  f6(@Param('id') id: string) {
    return Object.assign({});
  }

  // 게임 전적 가져오기
  // req : user id
  // res : {winner, loser}[5]
  @Get('/gameHistory')
  @ApiOperation({
    summary: 'req : user id, \
							res : status code(성공: 200, 실패: 404)',
  })
  f7(@Param('id') id: string) {
    return Object.assign({});
  }

  // 게임 승패 가져오기
  // req : user id
  // res : wins, loses
  @Get('/gameStat')
  @ApiOperation({ summary: 'req : user id, \
							res : wins, loses' })
  f8(@Param('id') id: string) {
    return Object.assign({});
  }
}
