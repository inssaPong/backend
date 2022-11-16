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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
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
} from './dto/swagger-channels.dto';

// 4-0, 4-1, 4-2, 4-3
@Controller('/channels')
@ApiTags('채널 API')
export class ChannelsController {
  constructor(private readonly channelsRepository: ChannelsRepository) {}

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
    description: '[400 Bad Request] 유효하지 않은 값이 들어와서 채널 생성 실패',
  })
  @ApiInternalServerErrorResponse({
    description: '[500 Internal Server Error] DB에서 채널 생성 실패',
  })
  @Post('/create')
  async createChannel(@Req() req, @Res() res, @Body() body) {
    this.logger.log('POST /channels/create');
    if (body.name === '') {
      this.logger.error('유효하지 않은 채널 이름입니다.');
      throw new BadRequestException();
    }
    const channel = {
      name: body.name, // TODO: 구현. dto를 통한 유효성사검사
      password: body.pw, // TODO: 구현. 암호화해서 DB에 넣기
    };
    // Description: req로 받은 channel의 name이 유효한지 검사
    try {
      // Description: 채널 생성
      await this.channelsRepository.createChannel(channel);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }

    try {
      // Description: 생성된 채널 id 가져오기
      const channelId = await this.channelsRepository.getChannelIdByChannelName(
        channel.name,
      );
      this.logger.log(`생성된 채널 id를 가져오는데 성공했습니다: ${channelId}`);
      // Description: channel_member 테이블에 추가
      const userId: string = req.user.id;
      await this.channelsRepository.insertAdminToChannelMember(
        userId,
        channelId,
      );
      this.logger.log('channel_member 테이블에 추가했습니다.');
      res.status(201).send({
        id: channelId,
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  // 참여할 수 있는 채널 목록 받기
  @ApiOperation({
    summary: '참여할 수 있는 채널 목록 받기',
  })
  @ApiOkResponse({
    description: '[200 OK] 참여할 수 있는 채널 목록 반환',
    type: ResponseGetChannelListDto, // TODO: 생각. example을 지우는 방법이 없을까?
  })
  @ApiInternalServerErrorResponse({
    description: '[500 internal Server Error] DB에 문제',
  })
  @Get('/list')
  async GetAvailableChannelList(@Req() req, @Res() res) {
    this.logger.log('GET /channels/list');
    const userId = req.user.id;
    let availableChannelList;
    try {
      availableChannelList =
        await this.channelsRepository.getAvailableChannelList(userId);
      this.logger.log('참여할 수 있는 채널 목록을 가져옵니다.');
      res.status(200).send(availableChannelList);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
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
    let joinedChannelList: Object[];
    try {
      joinedChannelList =
        await this.channelsRepository.getJoinedChannelListByUserId(userId);
      this.logger.log('참여 중인 채널 목록을 가져옵니다.');
      res.status(200).send(joinedChannelList);
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
