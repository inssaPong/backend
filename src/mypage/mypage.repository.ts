import { Injectable, Logger } from '@nestjs/common';
import { property } from 'lodash';
import { DatabaseService } from 'src/database/database.service';
import { GameStatDto } from './dto/create-mypage.dto';
import { UpdateUserInfoDto } from './dto/update-mypage.dto';

@Injectable()
export class MypageRepository {
  private readonly logger = new Logger(MypageRepository.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async getUserInfo(id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		SELECT nickname, avatar, twofactor_status
		FROM "user"
		WHERE id='${id}';
		`,
      );
      this.logger.debug(`User Info: ${databaseResponse}`);
      if (databaseResponse.length <= 0) return '404 Not Found'; // TODO status code 뱉는 걸로 바꾸기
      return 400;
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      return 400;
    }
  }

  async patchUserInfo(id: string, body: UpdateUserInfoDto) {
    try {
      let property: keyof typeof body;
      let databaseResponse;
      for (property in body) {
        databaseResponse = await this.databaseService.runQuery(
          `
			  UPDATE "user"
			  SET ${property} = '${body[property]}'
			  WHERE id='${id}' AND ${property} = '${body[property]}';
			`,
        );
        return 200;
      }
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      return 500;
    }
  }

  async patchTwoFactor(id: string, twofactor_status: boolean) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
			  UPDATE "user"
			  SET twofactor_status = ${twofactor_status}
			  WHERE id='${id}';
			`,
      );
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      return 404;
    }
  }

  async getFollows(id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		SELECT partner_id
		FROM "user_relation"
		WHERE user_id='${id}' AND block_status=false;
		`,
      );
      this.logger.debug(`Follows length: ${databaseResponse.length}`);
      this.logger.debug(`Follows: ${databaseResponse}`);
      return databaseResponse;
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      return 400;
    }
  }

  async getGameHistory(id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		SELECT winner_id, loser_id
		FROM "game_history"
		WHERE winner_id='${id}' OR loser_id='${id}';
		`,
      );
      this.logger.debug(`GameHistory length: ${databaseResponse.length}`);
      this.logger.debug(`GameHistory: ${databaseResponse}`);
      return databaseResponse;
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      return 400;
    }
  }

  async getWinHistory(id: string) {
    try {
      const wins = await this.databaseService.runQuery(
        `
		SELECT id
		FROM "game_history"
		WHERE winner_id='${id}';
		`,
      );
      return wins;
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      return 400;
    }
  }

  async getLoseHistory(id: string) {
    try {
      const loses = await this.databaseService.runQuery(
        `
		SELECT id
		FROM "game_history"
		WHERE loser_id='${id}';
		`,
      );
      return loses;
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      return 400;
    }
  }
}
