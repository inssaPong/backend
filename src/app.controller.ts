import { Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

// 2-1
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

// 1-1, 1-2, 1-3, 1-4
@Controller("/login")
export class Login {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

// 2-2, 2-4
@Controller("/users")
export class Users {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

// 3-1, 3-2
@Controller("/games")
@ApiTags('게임 API')
export class Games {
  constructor(private readonly appService: AppService) {}

  // 매칭 중 첫 페이지 들어옴
  // req : id 
  // res : id, nickname
	@Get()
  @ApiOperation({summary: 'req : id, \
                           res : id, nickname',
                description: 'req : id, \
                              res : id, nickname'})
	f1(@Param('id') id: string) {
    return Object.assign({
      id: `${id}`,
      nickname: `${id}`
    });
	};

  // 게임 끝날 때
  // post, put
  // req: 승자 id, 패자 id
  // res: X. 상태코드 리다이렉트 홈페이지
  @Post()
  @ApiOperation({summary: 'req : 승자 id, 패자 id, \
                           res :',
                description: 'req : 승자 id, 패자 id, \
                              res :'})
	f2(@Param('id') id1: string,
  @Param('id2') id2: string,) {
    return Object.assign({});
	};

  // 게임 관전
  // req: p1 id
  // res: p1 id, p1 nickname, p2 id, p2 nickname
  @Get('/watch')
  @ApiOperation({summary: 'req : p1 id, \
                           res : p1 id, p1 nickname, p2 id, p2 nickname', 
                description: 'req : p1 id, \
                              res :p1 id, p1 nickname, p2 id, p2 nickname' })
	f3(@Param('id') id: string,) {
    return Object.assign({});
	};

  // 게임 초대
  // req: 상대방 id
  // res: 상태코드(200, 404)
  @Get('/invite')
  @ApiOperation({summary: 'req : 상대방 id, \
                           res : 상태코드(200, 404)',
                description: 'req : 상대방 id, \
                              res : 상태코드(200, 404)' })
	f4(@Param('id') id: string,) {
    return Object.assign({});
	};
}

// 4-0, 4-1, 4-2, 4-3
@Controller("/channels")
@ApiTags('채팅 API')
export class Channels {
  constructor(private readonly appService: AppService) {}

  // 참여 중인 채널 목록 받기
  // req : id
  // res : { 채널명 }들
	@Get('list/join')
  @ApiOperation({summary: 'req : id, \
                           res : { 채널 id, 채널명 }들',
                description: 'req : id, \
                              res : { 채널 id, 채널명 }들'})
	f1(@Param('id') id: string) {
    return Object.assign({
    });
	};

  // 채널 목록 받기
  // req : id
  // res : { 채널명, 비밀번호 유무 }들
	@Get('list')
  @ApiOperation({summary: 'req : id, \
                           res : { 채널 id, 채널명, 비밀번호 유무 }들',
                description: 'req : id, \
                              res : { 채널 id, 채널명, 비밀번호 유무 }들'})
	f2(@Param('id') id: string) {
    return Object.assign({
    });
	};
  
  // 채널 입장
  // req : user id, channel id, channel pw
  // res : 상태코드(비밀번호 틀린 거(403)랑 ban(204) 구분)
	@Post('enter')
  @ApiOperation({summary: 'req : {user id, channel id, channel pw}, \
                           res : 상태코드 (Invalid PW(403)랑 ban(204), enter(201))',
                description: 'req : {user id, channel id, channel pw}, \
                              res : 상태코드 (Invalid PW(403)랑 ban(204), enter(201))'})
	f3(@Param('id') id: string) {
    return Object.assign({
    });
	};

  // 채널 참여 중인 유저
  // req : channel id
  // res : user id[]
	@Get('room/users')
  @ApiOperation({summary: 'req : channel id, \
                           res : user id[]',
                description: 'req : channel id, \
                              res : user id[]'})
	f4(@Param('id') id: string) {
    return Object.assign({
    });
	};

  // 유저 상태
  // req : user id[]
  // res : userStatus{id, status}[]
	@Get('room/users/status')
  @ApiOperation({summary: 'req : user id[], \
                           res : userStatus{id, status}[]',
                description: 'req : user id[], \
                              res : userStatus{id, status}[]'})
	f5(@Param('id') id: string) {
    return Object.assign({
    });
	};

  // 채팅방 나가기
  // req : user id, channel id
  // res : status code (성공: 202)
	@Get('room/exit')
  @ApiOperation({summary: 'req : user id, channel id, \
                           res : status code(성공: 202)',
                description: 'req : user id, channel id, \
                              res : status code(성공: 202)'})
	f6(@Param('id') id: string) {
    return Object.assign({
    });
	};

  // 채널 개설
  // req : user id, channel name, channel pw
  // res : channel id, status code (성공: 202, 실패: )
	@Post('create')
  @ApiOperation({summary: 'req : user id, channel name, channel pw, \
                           res : channel id, status code(성공: 202, 실패: )',
                description: 'req : user id, channel name, channel pw, \
                              res : channel id, status code(성공: 202, 실패: )'})
	f7(@Param('id') id: string) {
    return Object.assign({
    });
	};

  // DM
  // req : sender id, reciever id
  // res : status code (성공: 200 or 201, 실패: )
  // 200: DM 연결, 201: 신규 DM 연결
  @Put('dm')
  @ApiOperation({summary: 'req : sender id, reciever id, \
                           res : status code(성공: 200 or 201, 실패: )',
                description: 'req : sender id, reciever id, \
                              res : status code(성공: 200 or 201, 실패: )'})
	f8(@Param('id') id: string) {
    return Object.assign({
    });
	};
}
