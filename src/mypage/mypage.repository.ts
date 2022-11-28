import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MypageRepository {
  private readonly logger = new Logger(MypageRepository.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async getUserInfo(user_id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT id, nickname, avatar, twofactor_status
          FROM "user"
          WHERE id = $1;
        `,
        [user_id],
      );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`[${this.getUserInfo.name}] ${error}`);
      console.log(error);
      throw error;
    }
  }

  async getUserIdByNickname(nickname: string) {
    try {
      const result = await this.databaseService.runQuery(
        `
          SELECT id
          FROM "user"
          WHERE nickname = $1;
        `,
        [nickname],
      );
	  return result;
    } catch (error) {
      this.logger.error(`getUserIdByNickname: ${error}`);
      throw error;
    }
  }

  async updateNickname(user_id: string, nickname: string) {
    try {
      await this.databaseService.runQuery(
        `
          UPDATE "user"
          SET nickname = $1
          WHERE id = $2;
        `,
        [nickname, user_id],
      );
      return 200;
    } catch (error) {
      this.logger.error(`updateNickname: ${error}`);
      throw error;
    }
  }

  async updateAvatar(user_id: string, avatar: string) {
    try {
      await this.databaseService.runQuery(
        `
          UPDATE "user"
          SET avatar = NULLIF($1, '')::bytea
          WHERE id = $2;
        `,
        [avatar, user_id],
      );
      return 200;
    } catch (error) {
      this.logger.error(`updateAvatar: ${error}`);
      throw error;
    }
  }


  async updateTwofactor(user_id: string, twofactor: boolean) {
    try {
      await this.databaseService.runQuery(
        `
          UPDATE "user"
          SET twofactor_status = $1
          WHERE id = $2;
        `,
        [twofactor, user_id],
      );
      return 200;
    } catch (error) {
      this.logger.error(`updateTwofactor: ${error}`);
      throw error;
    }
  }

  async getFollows(user_id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT partner_id
          FROM "user_relation"
          WHERE user_id = $1 AND block_status = false;
        `,
        [user_id],
      );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`getFollows: ${error}`);
      throw error;
    }
  }

  async getGameHistory(user_id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT id, winner_id, loser_id
          FROM "game_history"
          WHERE winner_id = $1 OR loser_id = $1
          ORDER BY id DESC
          LIMIT 5;
        `,
        [user_id],
      );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`[${this.getGameHistory.name}] ${error}`);
      throw error;
    }
  }

  async getWinHistory(user_id: string) {
    try {
      const wins = await this.databaseService.runQuery(
        `
          SELECT id
          FROM "game_history"
          WHERE winner_id = $1;
        `,
        [user_id],
      );
      return wins;
    } catch (error) {
      this.logger.error(`[${this.getWinHistory.name}] ${error}`);
      throw error;
    }
  }

  async getLoseHistory(user_id: string) {
    try {
      const loses = await this.databaseService.runQuery(
        `
          SELECT id
          FROM "game_history"
          WHERE loser_id = $1;
        `,
        [user_id],
      );
      return loses;
    } catch (error) {
      this.logger.error(`[${this.getLoseHistory.name}] ${error}`);
      throw error;
    }
  }
}
