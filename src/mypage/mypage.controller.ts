import {
  Controller,
  Get,
  Patch,
  Body,
  Logger,
  Res,
  Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import {
  GameHistoryDto,
  MypageInfoDto,
  GameStatDto,
  FollowsDto,
  OneGameHistoryDto,
} from './dto/create-mypage.dto';
import { UpdateMypageInfoDto } from './dto/update-mypage.dto';
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
    description: '현재 클라이언트에 접속 중인 유저의 정보를 반환',
  })
  @ApiOkResponse({
    description: '성공',
    type: MypageInfoDto,
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @Get()
  async getUserInfo(@Req() req, @Res() res: Response) {
    try {
      const userInfoDB = await this.mypageRepository.getUserInfo(req.user.id);
      if (userInfoDB.length <= 0)
        throw new NotFoundException(`${req.user.id}: 존재하지 않는 유저`);
      if (userInfoDB[0][`avatar`] == null)
        userInfoDB[0][`avatar`] = this.mypageService.getDefaultImage();
      const userinfo: MypageInfoDto = {
        id: userInfoDB[0]['id'],
        nickname: userInfoDB[0]['nickname'],
        avatar: `${userInfoDB[0]['avatar']}`,
        twofactor_status: userInfoDB[0]['twofactor_status'],
      };
      this.logger.log(`${userinfo.id}의 정보를 가져오는데 성공`);
      res.status(200).send(userinfo);
    } catch (error) {
      this.logger.error(`[${this.getUserInfo.name}] ${error}`);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'nickname or avatar or twoFacktor_status 업데이트',
    description:
      'UserInfo를 업데이트 하는 API.\
	  \n request body에 UserInfo의 {nickname | avatar | twoFacktor_status} 해당 요소들 중 최소 하나만 존재하면 됨',
  })
  @ApiBody({
    type: UpdateMypageInfoDto,
  })
  @ApiOkResponse({
    description: '성공',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @Patch()
  async patchUserInfo(
    @Req() req,
    @Body() body: UpdateMypageInfoDto,
    @Res() res: Response,
  ) {
    try {
      await this.mypageService.updateMypageInfo(req.user.id, body);
      this.logger.log(`${req.user.id}의 정보를 업데이트하는데 성공`);
      res.status(200).send();
    } catch (error) {
      this.logger.error(`[${this.patchUserInfo.name}] ${error}`);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'follow 목록 가져오기',
    description: '해당 유저가 follow하고 있는 id 배열 반환',
  })
  @ApiOkResponse({
    description: '성공',
    type: FollowsDto,
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @Get('/follows')
  async getFollows(@Req() req, @Res() res: Response) {
    try {
      const followsDB = await this.mypageRepository.getFollows(req.user.id);
      const follows: FollowsDto = { follow: [] };
      for (const element of followsDB) {
        follows.follow.push(element['partner_id'] as string);
      }
      this.logger.log(`${req.user.id}의 follow를 가져오는데 성공`);
      res.status(200).send(follows);
    } catch (error) {
      this.logger.error(`[${this.getFollows.name}] ${error}`);
      throw error;
    }
  }

  @ApiOperation({
    summary: '게임 전적 기록 가져오기',
    description: '해당 유저의 게임 전적 기록 가져오기',
  })
  @ApiOkResponse({
    description: '성공',
    type: GameHistoryDto,
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @Get('/gameHistory')
  async getGameHistory(@Req() req, @Res() res: Response) {
    try {
      const gameHistoryDB = await this.mypageRepository.getGameHistory(
        req.user.id,
      );
      const gameHistory: GameHistoryDto = {
        gameHistory: [],
      };
      for (const element of gameHistoryDB) {
        const oneGameHistory: OneGameHistoryDto = {
          winner: element['winner_id'],
          loser: element['loser_id'],
        };
        gameHistory.gameHistory.push(oneGameHistory);
      }
      this.logger.log(`${req.user.id}의 게임 전적을 가져오는데 성공`);
      res.status(200).send(gameHistory);
    } catch (error) {
      this.logger.error(`[${this.getGameHistory.name}] ${error}`);
      throw error;
    }
  }

  @ApiOperation({
    summary: '게임 승패 수 가져오기',
    description: '해당 유저의 게임 승 수, 패 수 가져오기',
  })
  @ApiOkResponse({
    description: '성공',
    type: GameStatDto,
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @Get('/gameStat')
  async getGameStat(@Req() req, @Res() res: Response) {
    try {
      const winHistoryDB = await this.mypageRepository.getWinHistory(
        req.user.id,
      );
      const loseHistoryDB = await this.mypageRepository.getLoseHistory(
        req.user.id,
      );
      const gameStat: GameStatDto = {
        wins: winHistoryDB.length,
        loses: loseHistoryDB.length,
      };
      this.logger.log(`${req.user.id}의 승패 수를 가져오는데 성공`);
      res.status(200).send(gameStat);
    } catch (error) {
      this.logger.error(`[${this.getGameStat.name}] ${error}`);
      throw error;
    }
  }
}
