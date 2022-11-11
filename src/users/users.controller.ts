import {
	Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiBadRequestResponse, ApiNoContentResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ApplyBlockDto, ChanageFollowStatusDto, GameHistoryDto, GameStatDto, OneGameHistoryDto, UserInfoDto } from './dto/create-users.dto';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

// 2-2, 2-4
@Controller('/users')
@ApiTags('유저 API')
export class UsersController {
	private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService, private readonly usersRepository: UsersRepository) {}

  @ApiOperation({
	  summary: '유저 검색',
	  description: '유저 검색하는 API\
	  \n결과: status code\
	  \n(\
		\n\t존재: 200, \
		\n\t존재X: 404, \
		\n\t에러: 500\
		\n)',
	})
	@ApiOkResponse({
		description: '유저 존재'
	})
	@ApiNotFoundResponse({
		description: '유저 존재하지 않음'
	})
	@ApiInternalServerErrorResponse({
		description: '서버 에러'
	})
	@Get()
  async findUser(@Query('id') id: string, @Res() res:Response) {
	try {
		const result = await this.usersRepository.findUser(id);
		this.logger.debug(`result: ${result}`);
		res.status(result).send();
	} catch (error) {
		this.usersService.errorController(error, res, this.logger, this.findUser.name);
	}
  }

  @ApiOperation({
	  summary: '게임 전적 기록 가져오기',
	  description:
      '해당 유저의 게임 전적 기록 가져오기'
	})
	@ApiOkResponse({
	  description: '성공',
	  type: GameHistoryDto,
	})
	@ApiNotFoundResponse({
		description: '해당 유저 없음'
	})
	@ApiInternalServerErrorResponse({
		description: '서버 에러'
	})
  @Get('/gameHistory')
async getGameHistory(@Query('id') id: string, @Res() res: Response) {
	try {
			const gameHistory_db_result = await this.usersRepository.getGameHistory(id);
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
	 catch (error) {
		this.usersService.errorController(error, res, this.logger, this.findUser.name);
	}
}

@ApiOperation({
	summary: '게임 승패 수 가져오기',
	description:
	'해당 유저의 게임 승 수, 패 수 가져오기'
})
@ApiOkResponse({
  description: '성공',
  type: GameStatDto,
})
@ApiNotFoundResponse({
	description: '해당 유저 없음'
})
@ApiInternalServerErrorResponse({
	description: '서버 에러'
})
@Get('/gameStat')
async getGameStat(@Query('id') id: string, @Res() res: Response) {
	try {
		const winHistory = await this.usersRepository.getWinHistory(id);
		const loseHistory = await this.usersRepository.getLoseHistory(id);
		const gameStat: GameStatDto = {
		  wins: winHistory.length,
		  loses: loseHistory.length,
		};
		res.status(200).send(gameStat);
	} catch (error) {
		this.usersService.errorController(error, res, this.logger, this.findUser.name);
	}
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
  @ApiNotFoundResponse({
	  description: '해당 유저 없음'
  })
  @ApiInternalServerErrorResponse({
	  description: '서버 에러'
  })
  @Get('/:id')
  async getUserInfo(@Param('id') target_id: string,@Req() req , @Res() res: Response) {
	try {
		const userInfo_db_result = await this.usersRepository.getUserInfo(target_id);
		const follow_status_db_result = await this.usersRepository.getFollowStatus(req.user.username, target_id);
		let userInfo: UserInfoDto;
			if (follow_status_db_result.length == 0){
			userInfo = new UserInfoDto(userInfo_db_result[0][`nickname`], userInfo_db_result[0][`avatar`], false);
		} else if (follow_status_db_result.length == 1){
			userInfo = new UserInfoDto(userInfo_db_result[0][`nickname`], userInfo_db_result[0][`avatar`], true);
		}else {
			throw new Error(`Undefined follow_status length: ${follow_status_db_result.length}`);
		}
		res.status(200).send(userInfo);
	} catch (error) {
		this.usersService.errorController(error, res, this.logger, this.findUser.name);
	}
  }

  @ApiOperation({
    summary: '팔로우 상태 변경',
    description:
      'body로 해당 유저와 팔로우 상태를 변경할 대상 유저의 id, 팔로우 여부를 보내면\
	  해당 유저와 대상 유저의 팔로우 상태를 업데이트\
	  \n\n**차단 중인 유저를 팔로우할 경우 자동으로 차단해제'
  })
  @ApiBody({
	type: ChanageFollowStatusDto,
  })
  @ApiOkResponse({
	description: '성공'
  })
  @ApiBadRequestResponse({
	description: '실패: 잘못된 Request 형식'
  })
  @ApiNotFoundResponse({
	  description: '해당 유저 없음'
  })
  @ApiInternalServerErrorResponse({
	  description: '서버 에러'
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
		this.usersService.errorController(error, res, this.logger, this.findUser.name);
	}
  }

  @ApiOperation({
    summary: '유저 차단하기',
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
	description: '실패: 잘못된 Request 형식'
  })
  @ApiNotFoundResponse({
	  description: '해당 유저 없음'
  })
  @ApiInternalServerErrorResponse({
	  description: '서버 에러'
  })
  @Patch('block')
  async blockUser(@Body() body: ApplyBlockDto, @Res() res: Response) {
	try {
		const relation_status = await this.usersRepository.getRelationStatus(body.user_id, body.block_id);
		if (relation_status.length == 1)
			this.usersRepository.blockFollow(body.user_id, body.block_id);
		else if (relation_status.length == 0)
			this.usersRepository.blockUnfollow(body.user_id, body.block_id);
		res.status(200).send();
	} catch (error) {
		this.usersService.errorController(error, res, this.logger, this.findUser.name);
	}
  }
}
