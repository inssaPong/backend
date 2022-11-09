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
  OneGameHistoryDto,
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
    const userInfo_db_result = await this.mypageRepository.getUserInfo(id);
    this.logger.debug(`User Info: ${userInfo_db_result}`);
    if (userInfo_db_result == 400) {
      this.logger.error(`400`);
      res.status(400).send();
	  return;
    }
	const userinfo: UserInfoDto = {
		nickname: userInfo_db_result[0]['nickname'],
		avatar: `${userInfo_db_result[0]['avatar']}`,
		twofactor_status: userInfo_db_result[0]['twofactor_status'],
	}
    res.status(200).send(userinfo);
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
	@Res() res: Response,
  ) {
    this.logger.debug(`result: ${body}`);
    const result = await this.mypageRepository.patchUserInfo(id, body);
	if (result == 200){
		this.logger.debug('patchUserInfo return 200')
		res.status(200).send();
	}
	if (result == 500){
		this.logger.log('patchUserInfo return 500');
		res.status(500).send();
		return;
	} else {
		this.logger.error('Undefined error in patchUserInfo');
		res.status(result).send();
	}
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
	if (follows_db_result == 500) {
		this.logger.error(`getFollows return 500`);
		res.status(500).send();
		return;
	  }
    const follows: FollowsDto = { follow: [] };
    for (const follow_id of follows_db_result) {
      this.logger.debug(`follow_id: ${follow_id['partner_id']}`);
      follows.follow.push(follow_id['partner_id'] as string);
    }
    res.status(200).send(follows);
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
    if (result == 500) {
      this.logger.error(`getGameHistory return 500`);
      res.status(500).send();
	  return;
    }
	const gameHistory: GameHistoryDto = {
		gameHistory: [],
	}
	for (const oneGameHistory_db_result of result){
		const oneGameHistory: OneGameHistoryDto = {
			winner: oneGameHistory_db_result['winner_id'],
			loser: oneGameHistory_db_result['loser_id'],
		}
		this.logger.debug(`winner: ${oneGameHistory.winner}, loser: ${oneGameHistory.loser}`);
		gameHistory.gameHistory.push(oneGameHistory);
	}
    res.status(200).send(gameHistory);
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
    if (winHistory == 500 || loseHistory == 500) {
      this.logger.error(`getWinHistory or getLoseHistory return 500`);
      res.status(500).send();
	  return;
    }
    const gameStat: GameStatDto = {
      wins: winHistory.length,
      loses: loseHistory.length,
    };
	res.status(200).send(gameStat);
  }
}
