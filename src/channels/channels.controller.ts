import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
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
import { logger } from 'handlebars';
import { ChannelsRepository } from './channels.repository';
import {
  RequestBodyConnectDmDto,
  RequestBodyChannelNameAndPwDto,
  RequestBodyUserListInChannelDto,
  ResponseChannelIdDto,
  ResponseGetChannelsListDto,
  ResponseGetEnteredChannelsListDto,
  ResponseUserStatusInChannelDto,
} from './dto/swagger-channels.dto';

// 4-0, 4-1, 4-2, 4-3
@Controller('/channels')
@ApiTags('채널 API')
export class ChannelsController {
  constructor(private readonly channelsRepository: ChannelsRepository) {}

  logger: Logger = new Logger(ChannelsController.name);

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
  async createChannel(@Req() req, @Res() res, @Body() body) {
    console.log(req);
    const channel_name = body.channel_name;
    const channel_pw = body.channel_pw;
    this.logger.debug(`channel name: ${channel_name}`);
    this.logger.debug(`channel password: ${channel_pw}`);
    const isSuccess = await this.channelsRepository.createChannel(
      channel_name,
      channel_pw,
    );
    if (!isSuccess) {
      res.status(400).send();
      return;
    }
    const channel_id = await this.channelsRepository.findChannelId(
      channel_name,
    );
    if (channel_id === -1) {
      res.status(400).send();
      return;
    }
    res.status(201).send();
    return Object.assign({
      channel_id: channel_id,
    });
  }

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
      { channel_id: '1', channel_name: 'channel 1', channel_pw: false }, // TODO: 질문. pw를 client에 전달해주는 건가?
      { channel_id: '2', channel_name: 'channel 2', channel_pw: true },
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
      { channel_id: '1', channel_name: 'channel 1' },
      { channel_id: '2', channel_name: 'channel 2' },
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
  validationAtEntry(@Query('id') id: number, @Res() res) {
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
    description: '[No Content] Ban',
  })
  @ApiForbiddenResponse({
    description: '[Forbidden] Invalid PW',
  })
  @Post('/enter')
  enterChannel(@Query('id') id: number, @Res() res) {
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
    return 201;
  }

  // TODO: 삭제. 삭제하지 않는다면 삭제
  // 채널에 참가 중인 유저 리스트 가져오기
  // @ApiOperation({
  //   summary: '채널에 참가 중인 유저 리스트 가져오기',
  // })
  // @ApiOkResponse({
  //   description: '[OK] 채널에 참가 중인 유저 리스트',
  //   type: ResponseGetUserInfoInChannelDto,
  // })
  // @Get('/room/users')
  // getUserInfoInChannel(@Query('id') id: string, @Res() res) {
  //   const isSuccess = true;
  //   if (!isSuccess) {
  //     res.status(400).send();
  //     return 400;
  //   }
  //   const arr = [
  //     { id: 'seungoh' }, // TODO: 질문. id: '$id' 형식이어야하는지?
  //     { id: 'dason' },
  //     { id: 'hyson' },
  //     { id: 'sehyan' },
  //     { id: 'sanjeon' },
  //   ];
  //   return arr;
  // }

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
  @Get('/room/users')
  getUserStatusInChannel(@Res() res) {
    const isSuccess = true;
    if (isSuccess) {
      res.status(200).send();
      const arr = [
        { user_id: 'seungoh', user_status: '1' },
        { user_id: 'dason', user_status: '2' },
        { user_id: 'hyson', user_status: '3' },
        { user_id: 'sehyan', user_status: '2' },
        { user_id: 'sehyan', user_status: '1' },
      ];
      return arr;
    } else {
      res.status(500).send();
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
  @Delete('/room/exit') // TODO: 질문.
  exitChannel(@Query('id') id: number, @Res() res) {
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
