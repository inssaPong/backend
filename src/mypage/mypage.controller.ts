import {
  Controller,
  Get,
  Query,
  Patch,
  Body,
  Logger,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  GameHistoryDto,
  UserInfoDto,
  GameStatDto,
  FollowsDto,
} from './dto/create-mypage.dto';
import { UpdateUserInfoDto } from './dto/update-mypage.dto';
import { MypageRepository } from './mypage.repository';
import { MypageService } from './mypage.service';
import { Response } from 'express';

// 2-2
@ApiTags('마이페이지 API')
@ApiResponse({ status: 200, description: '성공' })
@Controller('/mypage')
export class MypageController {
  private readonly logger = new Logger(MypageController.name);
  constructor(
    private readonly mypageService: MypageService,
    private readonly mypageRepository: MypageRepository,
  ) {}

  @ApiOperation({
    summary: 'mypage 유저 정보 가져오기',
    description:
      'query로 id 보내면 CreateUserInfoDto{nickname, avatar binary code, twoFactor 여부} 반환\
	  \n\n ** 현재는 query로 id를 받지만 나중에는 jwt에서 알아서 추출할 예정',
  })
  @ApiOkResponse({
    description: '성공',
    type: UserInfoDto,
  })
  @Get()
  async getUserInfo(@Query('id') id: string, @Res() res: Response) {
    // TODO mypage 안에 모든 API 싹다 id jwt에서 추출하는 걸로 바꾸기
    const userInfo = await this.mypageRepository.getUserInfo(id);
    this.logger.debug(`User Info: ${userInfo}`);
    if (userInfo == 400) {
      this.logger.error(`400`);
      return res.status(400).send();
    }
    return userInfo;
  }

  @ApiOperation({
    summary: 'nickname or avatar or twoFacktor_status 업데이트',
    description:
      'UserInfo를 업데이트 하는 API.\
	  \n request body에 UserInfo의 {nickname | avatar | twoFacktor_status} 해당 요소들 중 최소 하나만 존재하면 됨\
	  \n\n ** 현재는 query로 id를 받지만 나중에는 jwt에서 알아서 추출할 예정',
  })
  @ApiBody({
    type: UpdateUserInfoDto,
  })
  @ApiOkResponse({
    description: '성공',
  })
  @Patch()
  async patchUserInfo(
    @Query('id') id: string,
    @Body() body: UpdateUserInfoDto,
  ) {
    this.logger.debug(`result: ${body}`);
    const result = await this.mypageRepository.patchUserInfo(id, body);
    return Object.assign({ code: result });
  }

  @ApiOkResponse({
    description: '성공',
    type: FollowsDto,
  })
  @ApiOperation({
    summary: 'follow 목록 가져오기',
    description:
      '해당 유저가 follow하고 있는 id 배열 반환\
	\n\n ** 현재는 query로 id를 받지만 나중에는 jwt에서 알아서 추출할 예정',
  })
  @Get('/follows')
  @ApiOperation({ summary: 'req : user id, res : follow[]' })
  async getFollows(@Query('id') id: string, @Res() res: Response) {
    const follows_db_result = await this.mypageRepository.getFollows(id);
    if (follows_db_result == 400) {
      this.logger.error(`400`);
      return res.status(400).send();
    }
    let follows: FollowsDto = { id: [] };
    for (const follow_id of follows_db_result) {
      this.logger.debug(`follow_id: ${follow_id['partner_id']}`);
      follows.id.push(follow_id['partner_id'] as string);
    }
    return follows;
  }

  @ApiOkResponse({
    description: '성공',
    type: GameHistoryDto,
  })
  @ApiOperation({
    summary: '게임 전적 기록 가져오기',
    description:
      '해당 유저의 게임 전적 기록 가져오기\
	\n\n ** 현재는 query로 id를 받지만 나중에는 jwt에서 알아서 추출할 예정',
  })
  @Get('/gameHistory')
  async getGameHistory(@Query('id') id: string, @Res() res: Response) {
    const result = await this.mypageRepository.getGameHistory(id);
    if (result == 400) {
      this.logger.error(`400`);
      return res.status(400).send();
    }
    return result;
  }

  @ApiOkResponse({
    description: '성공',
    type: GameStatDto,
  })
  @ApiOperation({
    summary: '게임 승패 수 가져오기',
    description:
      '해당 유저의 게임 승 수, 패 수 가져오기\
	\n\n ** 현재는 query로 id를 받지만 나중에는 jwt에서 알아서 추출할 예정',
  })
  @ApiOperation({ summary: 'req : user id, res : wins, loses' })
  @Get('/gameStat')
  async getGameStat(@Query('id') id: string, @Res() res: Response) {
    const winHistory = await this.mypageRepository.getWinHistory(id);
    const loseHistory = await this.mypageRepository.getLoseHistory(id);
    if (winHistory == 400 || loseHistory == 400) {
      this.logger.error(`400`);
      return res.status(400).send();
    }
    const gameStat: GameStatDto = {
      wins: winHistory.length,
      loses: loseHistory.length,
    };
    return gameStat;
  }
}
