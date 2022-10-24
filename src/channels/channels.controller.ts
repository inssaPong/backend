import { Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';

// 4-0, 4-1, 4-2, 4-3
@Controller('/channels')
@ApiTags('채널 API')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}
  // 참여 중인 채널 목록 받기
  // req : (body)id
  // res : { 채널명 }들
  @Get('/list/join')
  @ApiOperation({
    summary:
      'req : id, \
                           res : { 채널 id, 채널명 }들',
    description:
      'req : id, \
                              res : { 채널 id, 채널명 }들',
  })
  f1(@Param('id') id: string) {
    return Object.assign({});
  }

  // 채널 목록 받기
  // req : (body)id
  // res : { 채널명, 비밀번호 유무 }들
  @Get('/list')
  @ApiOperation({
    summary:
      'req : id, \
                           res : { 채널 id, 채널명, 비밀번호 유무 }들',
    description:
      'req : id, \
                              res : { 채널 id, 채널명, 비밀번호 유무 }들',
  })
  f2(@Param('id') id: string) {
    return Object.assign({});
  }

  // 채널 입장
  // req : (body)user id, (body)channel id, (body)channel pw
  // res : 상태코드(비밀번호 틀린 거(403)랑 ban(204) 구분)
  @Post('/enter')
  @ApiOperation({
    summary:
      'req : {user id, channel id, channel pw}, \
                           res : 상태코드 (Invalid PW(403)랑 ban(204), enter(201))',
    description:
      'req : {user id, channel id, channel pw}, \
                              res : 상태코드 (Invalid PW(403)랑 ban(204), enter(201))',
  })
  f3(@Param('id') id: string) {
    return Object.assign({});
  }

  // 채널 참여 중인 유저
  // req : (body)channel id
  // res : user id[]
  @Get('/room/users')
  @ApiOperation({
    summary: 'req : channel id, \
                           res : user id[]',
    description:
      'req : channel id, \
                              res : user id[]',
  })
  f4(@Param('id') id: string) {
    return Object.assign({});
  }

  // 유저 상태
  // req : (body)user id[]
  // res : userStatus{id, status}[]
  @Get('/room/users/status')
  @ApiOperation({
    summary:
      'req : user id[], \
                           res : userStatus{id, status}[]',
    description:
      'req : user id[], \
                              res : userStatus{id, status}[]',
  })
  f5(@Param('id') id: string) {
    return Object.assign({});
  }

  // 채팅방 나가기
  // req : (body)user id, (body)channel id
  // res : status code (성공: 202)
  @Get('/room/exit')
  @ApiOperation({
    summary:
      'req : user id, channel id, \
                           res : status code(성공: 202)',
    description:
      'req : user id, channel id, \
                              res : status code(성공: 202)',
  })
  f6(@Param('id') id: string) {
    return Object.assign({});
  }

  // 채널 개설
  // req : (body)user id, (body)channel name, (body)channel pw
  // res : channel id, status code (성공: 202, 실패: )
  @Post('/create')
  @ApiOperation({
    summary:
      'req : user id, channel name, channel pw, \
                           res : channel id, status code(성공: 202, 실패: )',
    description:
      'req : user id, channel name, channel pw, \
                              res : channel id, status code(성공: 202, 실패: )',
  })
  f7(@Param('id') id: string) {
    return Object.assign({});
  }

  // DM
  // req : (body)sender id, (body)reciever id
  // res : status code (성공: 200 or 201, 실패: )
  // 200: DM 연결, 201: 신규 DM 연결
  @Put('/dm')
  @ApiOperation({
    summary:
      'req : sender id, reciever id, \
                           res : status code(성공: 200 or 201, 실패: )',
    description:
      'req : sender id, reciever id, \
                              res : status code(성공: 200 or 201, 실패: )',
  })
  f8(@Param('id') id: string) {
    return Object.assign({});
  }
}
