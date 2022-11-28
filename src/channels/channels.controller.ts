import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Logger,
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
  RequestCreateChannelDto,
  RequestEnterChannelDto,
  ResponseChannelNameDto,
  ResponseCreateChannelDto,
  ResponseGetAvailableChannelListDto,
  ResponseGetJoinedChannelListDto,
  ResponseUsersIdInChannelDto,
} from './dto/swagger-channels.dto';
import { ChannelsService } from './channels.service';
import { User } from 'src/login/user.decorator';
import { FtUserDto } from 'src/login/dto/login.dto';
import { CreateChannelDto, EnterChannelDto } from './dto/channels.dto';

@Controller('/channels')
@ApiTags('채널 API')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  private readonly logger = new Logger(ChannelsController.name);

  @ApiOperation({ summary: '채널 생성' })
  @ApiBody({ type: RequestCreateChannelDto })
  @ApiCreatedResponse({
    description: '채널 생성 성공',
    type: ResponseCreateChannelDto,
  })
  @ApiBadRequestResponse({ description: '유효하지 않은 request' })
  @ApiInternalServerErrorResponse({ description: 'DB 문제' })
  @Post('/create')
  async createChannel(
    @User() user: FtUserDto,
    @Body() channel: CreateChannelDto,
    @Res() res,
  ) {
    this.logger.log('POST /channels/create');

    const channelId =
      await this.channelsService.createChannelAndReturnChannelId(
        user.id,
        channel.name,
        channel.password,
      );
    res.status(201).send({
      id: channelId,
    });
  }

  @ApiOperation({ summary: '참여할 수 있는 채널 목록 받기' })
  @ApiOkResponse({ type: ResponseGetAvailableChannelListDto })
  @ApiInternalServerErrorResponse({ description: 'DB에 문제' })
  @Get('/list')
  async getAvailableChannelList(@User() user: FtUserDto, @Res() res) {
    this.logger.log('GET /channels/list');

    const availableChannelList =
      await this.channelsService.getAvailableChannelList(user.id);
    res.status(200).send(availableChannelList);
  }

  @ApiOperation({ summary: '참여 중인 채널 목록 받기' })
  @ApiOkResponse({
    description: '참여 중인 채널 목록 반환',
    type: ResponseGetJoinedChannelListDto,
  })
  @ApiInternalServerErrorResponse({ description: 'DB 문제' })
  @Get('/list/join')
  async getJoinedChannelList(@User() user: FtUserDto, @Res() res) {
    this.logger.log('GET /channels/list/join');

    const joinedChannelList = await this.channelsService.getJoinedChannelList(
      user.id,
    );
    res.status(200).send(joinedChannelList);
  }

  @ApiOperation({ summary: '채널 입장' })
  @ApiBody({ type: RequestEnterChannelDto })
  @ApiCreatedResponse({ description: '입장 성공' })
  @ApiNoContentResponse({ description: '밴' })
  @ApiForbiddenResponse({ description: '유효하지 않은 비밀번호' })
  @Post('/enter')
  async enterChannel(
    @Query('channel_id') channel_id: number,
    @User() user: FtUserDto,
    @Body() channel: EnterChannelDto,
    @Res() res,
  ) {
    this.logger.log('POST /channels/enter');

    await this.channelsService.enterChannel(
      channel_id,
      channel.password,
      user.id,
    );
    res.status(201).send();
  }

  @ApiOperation({ summary: '채널 이름 가져오기' })
  @ApiOkResponse({
    description: '채널 이름 반환',
    type: ResponseChannelNameDto,
  })
  @ApiInternalServerErrorResponse({ description: 'DB에 문제' })
  @Get('/room/name')
  async getChannelName(@Query('channel_id') channel_id: number, @Res() res) {
    this.logger.log('GET /room/name');

    const channelName = await this.channelsService.getChannelName(channel_id);
    res.status(200).send({
      name: channelName,
    });
  }

  @ApiOperation({ summary: '채널에 참가 중인 유저 id 리스트 가져오기' })
  @ApiOkResponse({ type: ResponseUsersIdInChannelDto })
  @ApiInternalServerErrorResponse({ description: 'DB에 문제' })
  @Get('/room/users')
  async getUserIdListInChannel(
    @Query('channel_id') channel_id: number,
    @Res() res,
  ) {
    this.logger.log('GET /channels/room/users');

    const usersId = await this.channelsService.getUserIdListInChannel(
      channel_id,
    );
    res.status(200).send(usersId);
  }

  @ApiOperation({ summary: '채팅방 나가기' })
  @ApiOkResponse({ description: 'Channel exit success' })
  @ApiBadRequestResponse({ description: 'Channel exit falied' })
  @ApiInternalServerErrorResponse({ description: 'DB에 문제' })
  @Delete('/room/exit')
  async exitChannel(
    @Query('channel_id') channel_id: number,
    @User() user: FtUserDto,
    @Res() res,
  ) {
    this.logger.log('DELETE /channels/room/exit');

    await this.channelsService.exitChannel(channel_id, user.id);
    res.status(200).send();
  }
}
