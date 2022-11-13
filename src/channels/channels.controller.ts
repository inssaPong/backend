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
  RequestBodyConnectDmDto,
  RequestBodyChannelNameAndPwDto,
  ResponseChannelIdDto,
  ResponseGetChannelListDto,
  ResponseGetEnteredChannelListDto,
  ResponseUserStatusInChannelDto,
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
    Logger.log('/create', 'Channels API');

    const channel = {
      name: body.channel_name, // TODO: 구현. dto를 통한 유효성사검사
      password: body.channel_pw, // TODO: 구현. 암호화해서 DB에 넣기
    };
    // Description: req로 받은 channel의 name이 유효한지 검사
    if (channel.name === '') {
      this.logger.error('유효하지 않은 채널 이름입니다.');
      return res.status(400).send();
    }

    try {
      // Description: 채널 생성
      await this.channelsRepository.createChannel(channel);
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
    }

    try {
      // Description: 생성된 채널 id 가져오기
      const channelId: number =
        await this.channelsRepository.getChannelIdByChannelName(channel.name);
      this.logger.log(`생성된 채널 id를 가져오는데 성공했습니다: ${channelId}`);

      // Description: channel_member 테이블에 추가
      const userId: string = req.user.id;
      await this.channelsRepository.insertChannelMember(userId, channelId);
      this.logger.log('channel_member 테이블에 추가했습니다.');
      return res.status(201).send({
        id: channelId,
      });
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
    }
  }

  // 전체 채널 목록 받기
  @ApiOperation({
    summary: '전체 채널 목록 받기',
  })
  @ApiOkResponse({
    description: '[200 OK] 전체 채널 목록 반환',
    type: ResponseGetChannelListDto, // TODO: 생각. example을 지우는 방법이 없을까?
  })
  @ApiBadRequestResponse({
    description: '[400 Bad Request] 전체 채널을 찾을 수 없음',
  })
  @Get('/list')
  async GetAllChannelList(@Res() res) {
    Logger.log('/list', 'Channels API');
    // Description: 전체 채널 목록 가져오기
    try {
      const channels = await this.channelsRepository.getChannelList();
      if (channels.length === 0) {
        this.logger.log('한 개의 채널도 존재하지 않습니다.');
        return res.status(400).send;
      }
      this.logger.log('전체 채널 목록을 가져옵니다.');
      return res.status(200).send(channels);
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
    }
  }

  // 참가 중인 채널 목록 받기
  @ApiOperation({
    summary: '참여 중인 채널 목록 받기',
    description:
      '전달 받은 jwt를 읽고 user_id를 가져와서 channel_member에 있는 참여중인 채널 목록 가져오기',
  })
  @ApiOkResponse({
    description: '[200 OK] 참여 중인 채널 목록 반환',
    type: ResponseGetEnteredChannelListDto,
  })
  @ApiBadRequestResponse({
    description: '[400 Bad Request] !!!',
  })
  @Get('/list/join')
  async getEnteredChannelList(@Req() req, @Res() res) {
    Logger.log('/list/join', 'channels API');
    const user = req.user;
    if (user === undefined) {
      console.log('test');
    }
    let joinedChannelList;
    try {
      joinedChannelList =
        await this.channelsRepository.getJoinedChannelListByUserId(user.id);
      if (joinedChannelList.length === 0) {
        this.logger.log('참가중인 채널을 찾을 수 없습니다.');
        return res.status(400).send();
      }
      this.logger.log('참가 중인 채널 목록을 가져옵니다.');
      return res.status(200).send(joinedChannelList);
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
    }
  }

  // 채널 입장 시 유효성 검사
  @ApiOperation({
    summary: '채널 입장 시 유효성 검사',
  })
  @ApiOkResponse({
    description: '[200 OK] Access Successful',
  })
  @ApiForbiddenResponse({
    description: '[403 Forbidden] Access Denied',
  })
  @ApiInternalServerErrorResponse({
    description: '[500 Internal Server Error] DB에 문제',
  })
  @Get('/enter')
  async validationAtEntry(
    @Query('channel_id') channel_id: number,
    @Req() req,
    @Res() res,
  ) {
    const channelId = Number(channel_id); // TODO: 수정. dto를 통해 변환하기. class-transformer
    try {
      const isJoined = await this.channelsRepository.isJoinedChannel(
        req.user.id,
        channelId,
      );
      if (isJoined === false) {
        this.logger.log('참가 중인 채널이 아닙니다.');
        return res.status(403).send();
      }
      const channelName =
        await this.channelsRepository.getChannelNameByChannelId(channelId);
      this.logger.log('참가 중인 채널입니다.');
      return res.status(200).send(channelName);
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
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
    const userId: string = req.user.id;
    const channelId: number = Number(channel_id); // TODO: 수정. dto를 이용해서 number로 변환
    const inputPassword: string = body.pw;

    // Description: 밴 여부 확인
    try {
      const isBanned = await this.channelsRepository.isBannedChannel(
        userId,
        channelId,
      );
      if (isBanned === true) {
        this.logger.log('밴 당한 채널입니다.');
        return res.status(204).send();
      }
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
    }

    // Description: 유효한 비밀번호인지 확인
    try {
      const isValidPassword =
        await this.channelsRepository.isValidPasswordForChannel(
          channelId,
          inputPassword,
        );
      if (isValidPassword === false) {
        this.logger.log('유효하지 않은 채널 비밀번호입니다.');
        return res.status(403).send();
      }
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
    }

    // Description: DB channel_member 테이블에 추가
    try {
      await this.channelsRepository.insertChannelMember(userId, channelId);
      res.status(201).send();
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
    }
  }

  // TODO: 질문. user_satatus를 어떻게 가져오지?
  // 채널에 참가 중인 유저 상태 받기
  @ApiOperation({
    summary: '채널에 참가 중인 유저 상태 받기',
  })
  @ApiOkResponse({
    description: '[200 OK] 채널에 참가중인 유저 상태',
    type: ResponseUserStatusInChannelDto,
  })
  @ApiBadRequestResponse({
    description: '[400 Bad Request] 잘못된 request',
  })
  @ApiInternalServerErrorResponse({
    description: '[500 Internal Server Error] DB에 문제',
  })
  @Get('/room/users')
  getUserStatusInChannel(@Query('channel_id') channel_id: number, @Res() res) {
    const channelId = Number(channel_id); // TODO: 수정. dto를 통해 number로 변환
    try {
      const isSuccess =
        this.channelsRepository.getUsersStatusInJoinedChannel(channel_id);
      if (!isSuccess) {
        res.status(400).send();
        return;
      }
      const arr = [
        { user_id: 'seungoh', user_status: '0' },
        { user_id: 'dason', user_status: '1' },
        { user_id: 'hyson', user_status: '0' },
        { user_id: 'sehyan', user_status: '1' },
        { user_id: 'sanjeon', user_status: '2' },
      ];
      res.status(200).send(arr);
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
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
    const channelId = Number(channel_id); // TODO: 수정. dto를 통한 number 변환
    const userId = req.user.id;
    try {
      const isSuccess = await this.channelsRepository.exitChannel(
        userId,
        channelId,
      );
      if (isSuccess === false) {
        this.logger.log('잘못된 request입니다.');
        return res.status(400).send();
      }
      this.logger.log('채널 삭제에 성공했습니다.');
      res.status(200).send();
    } catch (error) {
      this.logger.error(error);
      return res.status(500).send();
    }
  }

  // TODO: 질문. 왜 Put이지?
  // TODO: content는 NOT NULL인데 어떻게 추가해야하지
  // DM 연결
  @ApiOperation({
    summary: 'DM 연결',
  })
  @ApiBody({
    type: RequestBodyConnectDmDto,
  })
  @ApiOkResponse({
    description: '[200 OK] DM connection successful',
  })
  @ApiCreatedResponse({
    description: '[201 Created] New DM connection',
  })
  @ApiBadRequestResponse({
    description: '[400 Bad Request] DM connection failed',
  })
  @Put('/dm')
  async connectDm(@Res() res) {
    const isSuccess = true;
    if (!isSuccess) {
      res.status(400).send();
      return;
    }
    res.status(200).send();
  }
}
