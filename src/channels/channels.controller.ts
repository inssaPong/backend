import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Logger,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  RequestBodyChannelNameAndPwDto,
  ResponseChannelIdDto,
  ResponseGetChannelListDto,
  ResponseGetEnteredChannelListDto,
  ResponseUsersIdInChannelDto,
} from './dto/swagger-channels.dto';
import { ChannelsService } from './channels.service';

// 4-0, 4-1, 4-2, 4-3
@Controller('/channels')
@ApiTags('채널 API')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  private readonly logger = new Logger(ChannelsController.name);

  // 채널 개설
  @ApiOperation({
    summary: '채널 개설',
  })
  @ApiBody({
    type: RequestBodyChannelNameAndPwDto,
  })
  @ApiCreatedResponse({
    description: '[201 Created] 채널 생성 성공',
    type: ResponseChannelIdDto,
  })
  @ApiBadRequestResponse({
    description: '[400 Bad Request] 유효하지 않은 값으로 요청 시',
  })
  @ApiInternalServerErrorResponse({
    description: '[500 Internal Server Error] DB 문제',
  })
  @Post('/create')
  async createChannel(@Req() req, @Res() res, @Body() body) {
    this.logger.log('POST /channels/create');

    try {
      const channelId =
        await this.channelsService.createChannelAndReturnChannelId(
          req.user.id,
          body.name,
          body.pw,
        );
      res.status(201).send({
        id: channelId,
      });
    } catch (exception) {
      throw exception;
    }
  }

  // 참여할 수 있는 채널 목록 받기
  @ApiOperation({
    summary: '참여할 수 있는 채널 목록 받기',
  })
  @ApiOkResponse({
    description: '[200 OK] 참여할 수 있는 채널 목록 반환',
    type: ResponseGetChannelListDto,
  })
  @ApiInternalServerErrorResponse({
    description: '[500 internal Server Error] DB에 문제',
  })
  @Get('/list')
  async getAvailableChannelList(@Req() req, @Res() res) {
    this.logger.log('GET /channels/list');
    try {
      const availableChannelList =
        await this.channelsService.getAvailableChannelList(req.user.id);
      res.status(200).send(availableChannelList);
    } catch (exception) {
      throw exception;
    }
  }

  // 참여 중인 채널 목록 받기
  @ApiOperation({
    summary: '참여 중인 채널 목록 받기',
  })
  @ApiOkResponse({
    description: '[200 OK] 참여 중인 채널 목록 반환',
    type: ResponseGetEnteredChannelListDto,
  })
  @ApiInternalServerErrorResponse({
    description: '[500 Internal Server Error] DB 문제',
  })
  @Get('/list/join')
  async getJoinedChannelList(@Req() req, @Res() res) {
    this.logger.log('GET /channels/list/join');
    try {
      const joinedChannelList = await this.channelsService.getJoinedChannelList(
        req.user.id,
      );
      res.status(200).send(joinedChannelList);
    } catch (exception) {
      throw exception;
    }
  }

  // 채널 입장
  @ApiOperation({
    summary: '채널 입장',
  })
  @ApiCreatedResponse({
    description: '[201 Created] Enter', // TODO: 질문. 왜 Created 였지?
  })
  @ApiNoContentResponse({
    description: '[204 No Content] Ban',
  })
  @ApiForbiddenResponse({
    description: '[403 Forbidden] Invalid PW',
  })
  @Post('/enter')
  async enterChannel(
    @Query('channel_id') channel_id: number,
    @Req() req,
    @Res() res,
    @Body() body,
  ) {
    this.logger.log('POST /channels/enter');
    try {
      await this.channelsService.enterChannel(req.user.id, channel_id, body.pw);
      res.status(201).send();
    } catch (exception) {
      throw exception;
    }
  }

  // Description: 채널 이름 가져오기
  @ApiOperation({
    summary: '채널 이름 가져오기',
  })
  @ApiOkResponse({
    description: '[200 OK] 채널 이름 반환',
  })
  @ApiBadRequestResponse({
    description: '[500 Internal Server Error] DB에 문제',
  })
  @Get('/room/name')
  async getChannelName(@Query('channel_id') channel_id: number, @Res() res) {
    this.logger.log('GET /room/name');
    try {
      const channelName = await this.channelsService.getChannelName(channel_id);
      res.status(200).send({
        name: channelName,
      });
    } catch (exception) {
      throw exception;
    }
  }

  @ApiOperation({
    summary: '채널에 참가 중인 유저 id 가져오기',
  })
  @ApiOkResponse({
    description: '[200 OK] 채널에 참가중인 유저 id',
    type: ResponseUsersIdInChannelDto,
  })
  @ApiInternalServerErrorResponse({
    description: '[500 Internal Server Error] DB에 문제',
  })
  @Get('/room/users')
  async getUserIdListInChannel(
    @Query('channel_id') channel_id: number,
    @Res() res,
  ) {
    this.logger.log('GET /channels/room/users');
    try {
      const usersId = await this.channelsService.getUserIdListInChannel(
        channel_id,
      );
      res.status(200).send(usersId);
    } catch (exception) {
      throw exception;
    }
  }

  // 채팅방 나가기
  @ApiOperation({
    summary: '채팅방 나가기',
  })
  @ApiOkResponse({
    description: '[200 Accepted] Channel exit success',
  })
  @ApiBadRequestResponse({
    description: '[400 Bad Request] Channel exit falied',
  })
  @ApiInternalServerErrorResponse({
    description: '[500 Internal Server Error] DB에 문제',
  })
  @Delete('/room/exit')
  async exitChannel(
    @Query('channel_id') channel_id: number,
    @Req() req,
    @Res() res,
  ) {
    this.logger.log('DELETE /channels/room/exit');
    try {
      await this.channelsService.exitChannel(req.user.id, channel_id);
      res.status(200).send();
    } catch (exception) {
      throw exception;
    }
  }
}
