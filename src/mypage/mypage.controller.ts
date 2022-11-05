import { Controller, Get, Query, Patch, Body, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBody,
  ApiResponse,
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
// ** 유저 본인의 아이디는 생략

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
      'req : Null, \n\
	  res : {nickname, avatar binary code, twoFactor 여부}',
  })
  @ApiCreatedResponse({
    description: '성공',
    status: 200,
    type: UserInfoDto,
  })
  @Get()
  async getUserInfo(@Query('id') id: string) {
    // TODO mypage 안에 모든 API 싹다 id jwt에서 추출하는 걸로 바꾸기
    const userInfo = await this.mypageRepository.getUserInfo(id);
    this.logger.log(`User Info: ${userInfo}`);
    if (userInfo == 400) return { code: 400 };
    return { code: 200, data: userInfo };
  }

  @ApiOperation({
    summary: 'nickname or avatar or twoFacktor_status 업데이트',
    description:
      'req : {nickname | avatar | twoFacktor_status} 해당 요소들 중 최소 하나만 존재하면 됨.\n\
							  res : status code(성공 : 200, 실패 : 500)',
  })
  @ApiBody({
    type: UpdateUserInfoDto,
  })
  @ApiCreatedResponse({
    description: '성공',
    status: 200,
  })
  @Patch()
  async patchUserInfo(
    @Query('id') id: string,
    @Body() body: UpdateUserInfoDto,
  ) {
    this.logger.log(`result: ${body}`);
    const result = await this.mypageRepository.patchUserInfo(id, body);
    return Object.assign({ code: result });
  }

  @ApiCreatedResponse({
    description: '성공',
    status: 200,
    type: FollowsDto,
  })
  @ApiOperation({
    summary: 'follow 목록 가져오기',
    description: 'req : \n\
	res : user_id[], status_code(성공:200, 실패:400)',
  })
  @Get('/follows')
  @ApiOperation({ summary: 'req : user id, res : follow[]' })
  async getFollows(@Query('id') id: string) {
    const follows_db_result = await this.mypageRepository.getFollows(id);
    if (follows_db_result == 400) return Object.assign({ code: 400 });
    let follows: FollowsDto = { id: [] };
    for (const follow_id of follows_db_result) {
      this.logger.log(`follow_id: ${follow_id['partner_id']}`);
      follows.id.push(follow_id['partner_id'] as string);
    }
    return Object.assign({ code: 200, data: follows });
  }

  @ApiCreatedResponse({
    description: '성공',
    status: 200,
    type: GameHistoryDto,
  })
  @ApiOperation({
    summary: '게임 전적 기록 가져오기',
    description: 'req : \
	res : GameHistory[], status_code(성공:200, 실패:400)',
  })
  @Get('/gameHistory')
  async getGameHistory(@Query('id') id: string) {
    const result = await this.mypageRepository.getGameHistory(id);
    if (result == 400) return Object({ code: result });
    return Object({ code: 200, data: result });
  }

  @ApiCreatedResponse({
    description: '성공',
    status: 200,
    type: GameStatDto,
  })
  @ApiOperation({
    summary: '게임 승패 수 가져오기',
    description: 'req : \n\
	res : GameStatDto, status_code(성공:200, 실패:400)',
  })
  @ApiOperation({ summary: 'req : user id, res : wins, loses' })
  @Get('/gameStat')
  async getGameStat(@Query('id') id: string) {
    const winHistory = await this.mypageRepository.getWinHistory(id);
    const loseHistory = await this.mypageRepository.getLoseHistory(id);
    if (winHistory == 400 || loseHistory == 400)
      return Object.assign({ code: 400 });
    const gameStat: GameStatDto = {
      wins: winHistory.length,
      loses: loseHistory.length,
    };
    return Object.assign({
      code: 200,
      data: gameStat,
    });
  }
}
