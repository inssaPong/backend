import {
  Controller,
  Get,
  Header,
  HttpCode,
  Query,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';

// 4-0, 4-1, 4-2, 4-3
@Controller('/api/channels')
@ApiTags('채널 API')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}
  // 참여 중인 채널 목록 받기
  // req : (body)id
  // res : { 채널명 }들
  @Get('/list/join')
  @ApiOperation({ summary: 'req : id, res : { 채널 id, 채널명 }[]' })
  @Header('access-control-allow-origin', '*')
  f1() {
    const arr = [
      { id: '1', name: '안뇽~~~~~' },
      { id: '2', name: '채팅방~~~~~' },
    ];
    return arr;
  }

  // 채널 목록 받기
  // req : (body)id
  // res : { 채널명, 비밀번호 유무 }들
  @Get('/list')
  @ApiOperation({
    summary: 'req : id, res : { 채널 id, 채널명, 비밀번호 유무 }[]',
  })
  @Header('access-control-allow-origin', '*')
  f2() {
    const arr = [
      { id: '1', name: '안뇽~~~~~', pw: 'false' },
      { id: '2', name: '채팅방~~~~~', pw: 'false' },
      { id: '3', name: '우와아아앙아~~!!!', pw: 'false' },
      { id: '4', name: '비밀번호 있지롱~~~', pw: 'true' },
    ];
    return arr;
  }

  // 채널 입장
  // req : (body)user id, (body)channel id, (body)channel pw
  // res : 상태코드(비밀번호 틀린 거(403)랑 ban(204) 구분)
  @Post('/enter')
  @HttpCode(204)
  @Header('access-control-allow-origin', '*')
  @ApiOperation({
    summary:
      'req : {user id, channel id, channel pw}, \
                           res : 상태코드 (Invalid PW(403)랑 ban(204), enter(201))',
  })
  f3() {
    return 204;
  }

  // 채널 참여 중인 유저
  // req : (body)channel id
  // res : user id[]
  @Get('/room/users')
  @ApiOperation({ summary: 'req : channel id, res : user id[]' })
  @Header('access-control-allow-origin', '*')
  f4() {
    const arr = [
      { id: 'seungoh' },
      { id: 'dason' },
      { id: 'hyson' },
      { id: 'sehyan' },
      { id: 'sanjeon' },
    ];
    return arr;
  }

  // 유저 상태
  // req : (body)user id[]
  // res : userStatus{id, status}[]
  @Get('/room/users/status')
  @ApiOperation({ summary: 'req : user id[], res : userStatus{id, status}[]' })
  @Header('access-control-allow-origin', '*')
  f5() {
    const arr = [
      { id: 'seungoh', status: '1' },
      { id: 'dason', status: '2' },
      { id: 'hyson', status: '3' },
      { id: 'sehyan', status: '2' },
      { id: 'sehyan', status: '1' },
    ];
    return arr;
  }

  // 채팅방 나가기
  // req : (body)user id, (body)channel id
  // res : status code (성공: 202)
  @Get('/room/exit')
  @HttpCode(202)
  @Header('access-control-allow-origin', '*')
  @ApiOperation({
    summary: 'req : user id, channel id, res : status code(성공: 202)',
  })
  f6(@Query('id') id: string) {
    return 202;
  }

  // 채널 개설
  // req : (body)user id, (body)channel name, (body)channel pw
  // res : channel id, status code (성공: 202, 실패: )
  @Post('/create')
  @HttpCode(202)
  @ApiOperation({
    summary:
      'req : user id, channel name, channel pw, \
                           res : channel id, status code(성공: 202, 실패: )',
  })
  @Header('access-control-allow-origin', '*')
  f7() {
    return Object.assign({
      id: '5',
    });
  }

  // DM
  // req : (body)sender id, (body)reciever id
  // res : status code (성공: 200 or 201, 실패: )
  // 200: DM 연결, 201: 신규 DM 연결
  @Put('/dm')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'req : sender id, reciever id, \
                           res : status code(성공: 200 or 201, 실패: )',
  })
  @Header('access-control-allow-origin', '*')
  f8() {
    return 200;
  }
}
