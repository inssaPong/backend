import {
  Controller,
  Get,
  Patch,
  Body,
  Logger,
  Res,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
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
      '현재 클라이언트에 접속 중인 유저의 정보를 반환',
  })
  @ApiOkResponse({
    description: '성공',
    type: UserInfoDto,
  })
  @ApiInternalServerErrorResponse({
	description: '서버 에러'
  })
  @Get()
  async getUserInfo(@Req() req, @Res() res: Response) {
	try {
		const userInfo_db_result = await this.mypageRepository.getUserInfo(req.user.id);
		this.logger.debug(`User Info: ${userInfo_db_result}`);
		const userinfo: UserInfoDto = {
			nickname: userInfo_db_result[0]['nickname'],
			avatar: `${userInfo_db_result[0]['avatar']}`,
			twofactor_status: userInfo_db_result[0]['twofactor_status'],
		}
		res.status(200).send(userinfo);

	} catch (error) {
		this.mypageService.errorHandler(error, res, this.logger, this.getUserInfo.name);
    }
  }

  @ApiOperation({
    summary: 'nickname or avatar or twoFacktor_status 업데이트',
    description:
      'UserInfo를 업데이트 하는 API.\
	  \n request body에 UserInfo의 {nickname | avatar | twoFacktor_status} 해당 요소들 중 최소 하나만 존재하면 됨',
  })
  @ApiBody({
    type: UpdateUserInfoDto,
  })
  @ApiOkResponse({
    description: '성공',
  })
  @ApiInternalServerErrorResponse({
	description: '서버 에러'
  })
  @Patch()
  async patchUserInfo(
    @Req() req,
    @Body() body: UpdateUserInfoDto,
	@Res() res: Response,
  ) {
	try {
		const result = await this.mypageRepository.patchUserInfo(req.user.id, body);
		res.status(200).send();
	} catch (error) {
		this.mypageService.errorHandler(error, res, this.logger, this.patchUserInfo.name);
  }
}

@ApiOperation({
	summary: 'follow 목록 가져오기',
    description:
	'해당 유저가 follow하고 있는 id 배열 반환',
})
@ApiOkResponse({
  description: '성공',
  type: FollowsDto,
})
@ApiInternalServerErrorResponse({
	description: '서버 에러'
  })
  @Get('/follows')
  async getFollows(@Req() req, @Res() res: Response) {
	try {
		const follows_db_result = await this.mypageRepository.getFollows(req.user.id);
		const follows: FollowsDto = { follow: [] };
		for (const follow_id of follows_db_result) {
		  this.logger.debug(`follow_id: ${follow_id['partner_id']}`);
		  follows.follow.push(follow_id['partner_id'] as string);
		}
		res.status(200).send(follows);
	} catch (error) {
		this.mypageService.errorHandler(error, res, this.logger, this.getFollows.name);
	}
  }

  @ApiOperation({
	summary: '게임 전적 기록 가져오기',
	description:
	  '해당 유저의 게임 전적 기록 가져오기',
  })
  @ApiOkResponse({
    description: '성공',
    type: GameHistoryDto,
  })
  @ApiInternalServerErrorResponse({
	description: '서버 에러'
  })
  @Get('/gameHistory')
  async getGameHistory(@Req() req, @Res() res: Response) {
	  try {
		  const result = await this.mypageRepository.getGameHistory(req.user.id);
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
	} catch (error) {
		this.mypageService.errorHandler(error, res, this.logger, this.getGameHistory.name);
	}
  }

  @ApiOperation({
	summary: '게임 승패 수 가져오기',
	description:
	  '해당 유저의 게임 승 수, 패 수 가져오기',
  })
  @ApiOkResponse({
    description: '성공',
    type: GameStatDto,
  })
  @ApiInternalServerErrorResponse({
	description: '서버 에러'
  })
  @Get('/gameStat')
  async getGameStat(@Req() req, @Res() res: Response) {
	try {
		const winHistory = await this.mypageRepository.getWinHistory(req.user.id);
		const loseHistory = await this.mypageRepository.getLoseHistory(req.user.id);
		const gameStat: GameStatDto = {
		  wins: winHistory.length,
		  loses: loseHistory.length,
		};
		res.status(200).send(gameStat);

	} catch (error) {
		this.mypageService.errorHandler(error, res, this.logger, this.getGameStat.name);
	}
  }
}
