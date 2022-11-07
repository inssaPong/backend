import { Controller, Delete, Get, Post, Put, Query, Res } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import {
  RequestBodyConnectDmDto,
  RequestBodyChannelNameAndPwDto,
  RequestBodyUserListInChannelDto,
  ResponseChannelIdDto,
  ResponseGetChannelsListDto,
  ResponseGetEnteredChannelsListDto,
  ResponseGetUserInfoInChannelDto,
  ResponseUserStatusInChannelDto,
} from './dto/swagger-channels.dto';

// 4-0, 4-1, 4-2, 4-3
@Controller('/channels')
@ApiTags('채널 API')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  // 전체 채널 목록 받기
  @ApiOperation({
    summary: '전체 채널 목록 받기',
  })
  @ApiOkResponse({
    type: ResponseGetChannelsListDto, // TODO: 생각. example을 지우는 방법이 없을까?
  })
  @ApiInternalServerErrorResponse({
    description: '[Internal Server Error] ???',
  })
  @Get('/list')
  GetChannelsList(@Res() res) {
    const isSuccess = true;
    if (!isSuccess) {
      res.status(500).send();
      return;
    }
    const arr = [
      { id: '1', name: 'channel 1', pw: 'false' }, // TODO: 질문. pw를 client에 전달해주는 건가?
      { id: '2', name: 'channel 2', pw: 'true' },
    ];
    return arr;
  }

  // 참여 중인 채널 목록 받기
  @ApiOperation({
    summary: '참여 중인 채널 목록 받기',
  })
  @ApiResponse({
    status: 200,
    type: ResponseGetEnteredChannelsListDto,
  })
  @Get('/list/join')
  getEnteredChannelsList() {
    const arr = [
      { id: '1', name: 'channel 1' },
      { id: '2', name: 'channel 2' },
    ];
    return arr;
  }

  // 채널 입장 시 유효성 검사
  @ApiOperation({
    summary: '채널 입장 시 유효성 검사',
  })
  @ApiOkResponse({
    description: '[OK] Access Successful',
  })
  @ApiForbiddenResponse({
    description: '[Forbidden] Access Denied',
  })
  @Get('/enter')
  validationAtEntry(@Query('id') id: string, @Res() res) {
    // 채널 입장 시 유효성 검사.
    // 입력된 쿼리로 DB를 통해 권한, 비밀번호 유무 등 유효성 검사.
    const isSuccess = true;
    if (!isSuccess) {
      res.status(403).send();
    }
    return;
  }

  // 채널 입장
  @ApiOperation({
    summary: '채널 입장',
  })
  @ApiCreatedResponse({
    description: '[Created] Enter',
  })
  @ApiNoContentResponse({
    // TODO: 질문. ban도 403으로 처리하면 안되는지? 현재 204
    description: '[No Content] Ban',
  })
  @ApiForbiddenResponse({
    description: '[Forbidden] Invalid PW',
  })
  @Post('/enter')
  enterChannel(@Query('id') id: string, @Res() res) {
    const isBan = true;
    if (isBan) {
      res.status(204).send();
      return 204;
    }
    const isValidatePW = true;
    if (!isValidatePW) {
      res.status(403).send();
      return 403;
    }
    return 204;
  }

  // 채널에 참가 중인 유저 리스트 가져오기
  @ApiOperation({
    summary: '채널에 참가 중인 유저 리스트 가져오기',
  })
  @ApiOkResponse({
    description: '[OK] 채널에 참가 중인 유저 리스트',
    type: ResponseGetUserInfoInChannelDto,
  })
  @Get('/room/users')
  getUserInfoInChannel(@Query('id') id: string, @Res() res) {
    const isSuccess = true;
    if (!isSuccess) {
      res.status(400).send();
      return 400;
    }
    const arr = [
      { id: 'seungoh' }, // TODO: 질문. id: '$id' 형식이어야하는지?
      { id: 'dason' },
      { id: 'hyson' },
      { id: 'sehyan' },
      { id: 'sanjeon' },
    ];
    return arr;
  }

  // TODO: 질문. req시 body에 데이터를 넣지 못하는데 어떻게 처리를 할 것인지?
  // 채널에 참가 중인 유저 상태 받기
  @ApiOperation({
    summary: '채널에 참가 중인 유저 상태 받기',
  })
  @ApiBody({
    type: RequestBodyUserListInChannelDto,
  })
  @ApiOkResponse({
    description: '[OK] 채널에 참가중인 유저 상태',
    type: ResponseUserStatusInChannelDto,
  })
  @Get('/room/users/status') // TODO: 질문. users/status를 user-status로 바꾸면 안되는지?
  getUserStatusInChannel(@Res() res) {
    const isSuccess = true;
    if (isSuccess) {
      res.status(200).send();
      const arr = [
        { id: 'seungoh', status: '1' },
        { id: 'dason', status: '2' },
        { id: 'hyson', status: '3' },
        { id: 'sehyan', status: '2' },
        { id: 'sehyan', status: '1' },
      ];
      return arr;
    } else {
      res.status(500).send();
      return;
    }
  }

  // 채널 개설
  @ApiOperation({
    summary: '채널 개설',
  })
  @ApiBody({
    type: RequestBodyChannelNameAndPwDto,
  })
  @ApiCreatedResponse({
    description: '[Created] Channel creation successful',
    type: ResponseChannelIdDto,
  })
  @ApiBadRequestResponse({
    description: '[Bad Request] Channel creation failed',
  })
  @Post('/create')
  createChannel(@Res() res) {
    const isSuccess = true;
    if (isSuccess) {
      res.status(201).send();

      return Object.assign({
        id: '5',
      });
    } else {
      res.status(400).send();
      return;
    }
  }

  // 채팅방 나가기
  @ApiOperation({
    summary: '채팅방 나가기',
  })
  @ApiAcceptedResponse({
    description: '[Accepted] Channel exit success',
  })
  @ApiBadRequestResponse({
    description: '[Bad Request] Channel exit falied',
  })
  @Delete('/room/exit')
  exitChannel(@Query('id') id: string, @Res() res) {
    const isSuccess = true;
    if (isSuccess) {
      res.status(202).send();
    } else {
      res.status(400).send();
    }
    return;
  }

  // DM 연결
  @ApiOperation({
    summary: 'DM 연결',
  })
  @ApiBody({
    type: RequestBodyConnectDmDto,
  })
  @ApiOkResponse({
    description: '[OK] DM connection successful',
  })
  @ApiCreatedResponse({
    description: '[Created] New DM connection',
  })
  @ApiBadRequestResponse({
    description: '[Bad Request] DM connection failed',
  })
  @Put('/dm')
  connectDm(@Res() res) {
    const isSuccess = true;
    if (isSuccess) {
      res.status(200).send();
    } else {
      res.status(400).send();
    }
    return;
  }
}
