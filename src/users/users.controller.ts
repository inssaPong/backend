import {
	Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { STATUS_CODES } from 'http';
import { boolean, options } from 'joi';
import { ApplyBlockDto, ChanageFollowStatusDto, GameHistoryDto, GameStatDto, OneGameHistoryDto, UserInfoDto } from './dto/create-users.dto';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

// 2-2, 2-4
@Controller('/users')
@ApiTags('유저 API')
export class UsersController {
	private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService, private readonly usersRepository: UsersRepository) {}

  // 유저 검색
  // req : user id
  // res : status code(성공: 200, 실패: 404)
  @ApiOperation({
	  summary: '유저 검색',
	  description: '유저 검색하는 API\n\
	  결과 status code(\
		\n존재: 200, \
		\n존재X: 400, \
		\n에러: 500)',
	})
	@Get()
  async findUser(@Query('id') id: string, @Res() res:Response) {
	const result = await this.usersRepository.findUser(id);
	this.logger.debug(`result: ${result}`);
	res.status(result).send();
  }

  @ApiOkResponse({
    description: '성공',
    type: GameHistoryDto,
  })
  @ApiOperation({
    summary: '게임 전적 기록 가져오기',
    description:
      '해당 유저의 게임 전적 기록 가져오기'
  })
  @Get('/gameHistory')
async getGameHistory(@Query('id') id: string, @Res() res: Response) {
  const gameHistory_db_result = await this.usersRepository.getGameHistory(id);
  if (gameHistory_db_result == 500) {
	this.logger.error(`getGameHistory return 500`);
	res.status(500).send();
	return;
  }
  const gameHistory: GameHistoryDto = {gameHistory: []
  }
  for (const oneGameHistory_db_result of gameHistory_db_result){
	const oneGameHistory :OneGameHistoryDto = {
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
	'해당 유저의 게임 승 수, 패 수 가져오기'
})
@Get('/gameStat')
async getGameStat(@Query('id') id: string, @Res() res: Response) {
  const winHistory = await this.usersRepository.getWinHistory(id);
  const loseHistory = await this.usersRepository.getLoseHistory(id);
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

  @ApiOperation({
    summary: '해당 유저 정보 가져오기',
    description:
      'query로 id 보내면 UserInfoDto{nickname, avatar binary code, follow 여부} 반환'
  })
  @ApiOkResponse({
    description: '성공',
    type: UserInfoDto,
  })
  @Get('/:id')
  async getUserInfo(@Param('id') target_id: string,@Req() req , @Res() res: Response) {
	try {
		const userInfo_db_result = await this.usersRepository.getUserInfo(target_id);
		const follow_status_db_result = await this.usersRepository.getFollowStatus(req.user.username, target_id);
		let userInfo: UserInfoDto;
		if (follow_status_db_result.length == 1){
			userInfo = new UserInfoDto(userInfo_db_result[0][`nickname`], userInfo_db_result[0][`avatar`], true);
		} else if (follow_status_db_result.length == 0){
			userInfo = new UserInfoDto(userInfo_db_result[0][`nickname`], userInfo_db_result[0][`avatar`], false);
		} else {
			throw new Error(`Undefined follow_status length: ${follow_status_db_result.length}`);
		}
		res.status(200).send(userInfo);
	} catch (error) {
		if (error == 400)
		this.logger.error(`Not found user return ${error}`);
		else if (error == 500)
		this.logger.error(`Database server error return ${error}`);
		res.status(error).send();
	}
  }

  // 팔로우 상태 변경
  // req : (body)user id, (body)follow id, (body)follow 여부
  // res :

  @ApiOperation({
    summary: '팔로우 상태 변경',
    description:
      'body로 해당 유저와 팔로우 상태를 변경할 대상 유저의 id, 팔로우 여부를 보내면\
	  해당 유저와 대상 유저의 팔로우 상태를 업데이트'
  })
  @ApiBody({
	type: ChanageFollowStatusDto,
  })
  @ApiOkResponse({
	description: '성공'
  })
  @ApiBadRequestResponse({
	description: '실패'
  })
  @Patch('follow')
  async changeFollowStatus(@Body() body: ChanageFollowStatusDto, @Req() req, @Res() res:Response) {
	try {
		if (body.follow_status == false){
			this.usersRepository.offFollowStatus(body.user_id, body.partner_id);
			this.logger.debug('success unfollow');
		} else if (body.follow_status == true) {
			this.usersRepository.onFollowStatus(body.user_id, body.partner_id);
			this.logger.debug('success follow');
		}
		res.status(200).send();
	}catch (error) {
		this.logger.error(`fail (unfollow | follow) return ${error}`);
		res.status(error).send();
	}
  }

  @ApiOperation({
    summary: '팔로우 차단하기',
    description:
      'body로 해당 유저와 차단할 유저의 id를 보내면\
	  차단할 유저 차단'
  })
  @ApiBody({
	type: ApplyBlockDto,
  })
  @ApiOkResponse({
	description: '성공'
  })
  @ApiBadRequestResponse({
	description: '실패'
  })
  @Patch('block')
  async blockUser(@Body() body: ApplyBlockDto, @Res() res: Response) {
	try {
		const relation_status = await this.usersRepository.getRelationStatus(body.user_id, body.block_id);
		if (relation_status.length == 1)
			this.usersRepository.blockFollow(body.user_id, body.block_id);
		else if (relation_status.length == 0)
			this.usersRepository.blockUnfollow(body.user_id, body.block_id);
		else
			throw 400
		res.status(200).send();
	} catch (error) {
		this.logger.error(`blockUser return ${error}`);
		res.status(error).send();
	}
  }
}
