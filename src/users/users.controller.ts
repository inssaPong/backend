import {
  Controller,
  Get,
  Header,
  HttpCode,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

// 2-2, 2-4
@Controller('/users')
@ApiTags('유저 API')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 유저 검색
  // req : user id
  // res : status code(성공: 200, 실패: 404)
  @Get()
  @ApiOperation({
    summary: 'req : user id, \
						   res : status code(성공: 200, 실패: 404)',
  })
  @Header('access-control-allow-origin', '*')
  @HttpCode(200)
  f1(@Query('id') id: string) {
    return 200;
  }

  // user 정보 가져오기
  // req : user id
  // res : {nickname, avatar binary code}
  @Get('/:id')
  @ApiOperation({ summary: 'req : user id, res : ' })
  @Header('access-control-allow-origin', '*')
  f2(@Query('id') id: string) {
    return Object.assign({
      nickname: 'test_nickname',
      avatar: 'test_avatart_binary_code',
    });
  }

  // 게임 전적 가져오기
  // req : user id
  // res : {winner, loser}[5]
  @Get('gameHistory')
  @ApiOperation({
    summary: 'req : user id, \
							res : status code(성공: 200, 실패: 404)',
  })
  @Header('access-control-allow-origin', '*')
  @HttpCode(200)
  f3(@Query('id') id: string) {
    return 200;
  }

  // 게임 승패 가져오기
  // req : user id
  // res : wins, loses
  @Get('gameStat')
  @ApiOperation({ summary: 'req : user id, \
							  res : wins, loses' })
  @Header('access-control-allow-origin', '*')
  f4(@Query('id') id: string) {
    return Object.assign({
      win: 9999,
      lose: 9998,
    });
  }

  // 팔로우 상태 변경
  // req : (body)user id, (body)follow id, (body)follow 여부
  // res :
  @Patch('follow')
  @ApiOperation({ summary: 'req : user id, follow id, follow 여부\
							res : ' })
  @Header('access-control-allow-origin', '*')
  f5(@Query('id') id: string) {
    return;
  }

  // user의 현재 접속 상태 가져오기
  // req : user id
  // res : user status
  @Get('status')
  @ApiOperation({ summary: 'req : user id, res : user status' })
  @Header('access-control-allow-origin', '*')
  f6(@Query('id') id: string) {
    return Object.assign({
      user_status: 'logged in',
    });
  }

  // 친구 차단하기
  // req : (body)user id, (body)block id
  // res :
  @Patch('block')
  @ApiOperation({ summary: 'req : user id, block id res : ' })
  @Header('access-control-allow-origin', '*')
  f7(@Query('id') id: string) {
    return;
  }
}
