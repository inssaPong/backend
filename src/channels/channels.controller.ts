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
  InternalServerErrorException,
  BadRequestException,
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
import { ChannelsRepository } from './channels.repository';
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
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly channelsRepository: ChannelsRepository,
  ) {}

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
      const channel_id =
        await this.channelsService.createChannelAndReturnChannelId(
          req.user.id,
          body.name,
          body.pw,
        );
      res.status(201).send({
        id: channel_id,
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
  async GetAvailableChannelList(@Req() req, @Res() res) {
    this.logger.log('GET /channels/list');
    try {
      const availableChannelList =
        await this.channelsService.GetAvailableChannelList(req.user.id);
      res.status(200).send(availableChannelList);
    } catch (exception) {
      throw exception;
    }
  }

  // 참여 중인 채널 목록 받기
  @ApiOperation({
    summary: '참여 중인 채널 목록 받기',
    description:
      '전달 받은 jwt를 읽고 user_id를 가져와서 channel_member에 있는 참여중인 채널 목록 가져오기',
  })
  @ApiOkResponse({
    description: '[200 OK] 참여 중인 채널 목록 반환',
    type: ResponseGetEnteredChannelListDto,
  })
  @Get('/list/join')
  async getJoinedChannelList(@Req() req, @Res() res) {
    this.logger.log('GET /channels/list/join');
    const userId = req.user.id;
    try {
      const joinedChannelList =
        await this.channelsRepository.getJoinedChannelIdListByUserId(userId);
      this.logger.log('참여 중인 채널 목록을 가져옵니다.');
      res.status(200).send(joinedChannelList);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
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
    const userId: string = req.user.id;
    const channelId: number = Number(channel_id); // TODO: 수정. dto를 이용해서 number로 변환
    const inputPassword: string = body.pw;

    // Description: 밴 여뷰 확인
    try {
      const isBanned = await this.channelsRepository.isBannedChannel(
        userId,
        channelId,
      );
      if (isBanned === true) {
        return res.status(204).send();
      }
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
    }

    // Description: 유효한 비밀번호인지?
    try {
      const isValidPassword =
        await this.channelsRepository.isValidPasswordForChannel(
          channelId,
          inputPassword,
        );
      if (isValidPassword === false) {
        return res.status(403).send();
      }
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
    }

    // Description: DB channel_member 테이블에 추가
    try {
      await this.channelsRepository.insertGuestToChannelMember(
        userId,
        channelId,
      );
      res.status(201).send();
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
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
    try {
      const channelName =
        await this.channelsRepository.getChannelNameByChannelId(channel_id);
      res.status(200).send(channelName);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
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
  async getUserIdInChannel(
    @Query('channel_id') channel_id: number,
    @Res() res,
  ) {
    this.logger.log('GET /channels/room/users');
    try {
      const usersId = await this.channelsRepository.getUsersIdInChannelMember(
        channel_id,
      );
      res.status(200).send(usersId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
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
    const channelId = Number(channel_id); // TODO: 수정. dto를 통한 number 변환
    const userId = req.user.id;
    try {
      const isSuccess = await this.channelsRepository.exitChannel(
        userId,
        channelId,
      );
      if (isSuccess === false) {
        this.logger.error('잘못된 request입니다.');
        throw new BadRequestException();
      }
      this.logger.log('채널 삭제에 성공했습니다.');
      res.status(200).send();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }
}
