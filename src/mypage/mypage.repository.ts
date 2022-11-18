import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UpdateUserInfoDto } from './dto/update-mypage.dto';

@Injectable()
export class MypageRepository {
  private readonly logger = new Logger(MypageRepository.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async getUserInfo(id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		SELECT id, nickname, avatar, twofactor_status
		FROM "user"
		WHERE id='${id}';
		`,
      );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`[${this.getUserInfo.name}] ${error}`);
      throw error;
    }
  }

  async patchUserInfo(id: string, body: UpdateUserInfoDto) {
    try {
      for (let [key, value] of Object.entries(body)) {
        if (key != 'id')
          await this.databaseService.runQuery(
            `
			UPDATE "user"
			SET ${key} = '${value}'
			WHERE id='${id}';
			`,
          );
      }
      return 200;
    } catch (error) {
      this.logger.error(`patchUserInfo: ${error}`);
      throw error;
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
      return databaseResponse;
    } catch (error) {
      this.logger.error(`getFollows: ${error}`);
      throw error;
    }
  }

  async getGameHistory(id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		SELECT winner_id, loser_id
		FROM "game_history"
		WHERE winner_id='${id}' OR loser_id='${id}'
		ORDER BY id DESC
		LIMIT 5;
		`,
      );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`[${this.getGameHistory.name}] ${error}`);
      throw error;
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
      this.logger.error(`[${this.getWinHistory.name}] ${error}`);
      throw error;
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
      this.logger.error(`[${this.getLoseHistory.name}] ${error}`);
      throw error;
    }
  }
}
