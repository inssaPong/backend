import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

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
		WHERE id=$1;
		`,
        [id],
      );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`[${this.getUserInfo.name}] ${error}`);
      console.log(error);
      throw error;
    }
  }

  async updateNickname(id: string, nickname: string) {
    try {
      await this.databaseService.runQuery(
        `
		UPDATE "user"
		SET nickname = $1
		WHERE id = $2;
		`,
        [nickname, id],
      );
      return 200;
    } catch (error) {
      this.logger.error(`updateNickname: ${error}`);
      throw error;
    }
  }

  async updateAvatar(id: string, avatar: string) {
    try {
      await this.databaseService.runQuery(
        `
		UPDATE "user"
		SET avatar = $1
		WHERE id = $2;
		`,
        [avatar, id],
      );
      return 200;
    } catch (error) {
      this.logger.error(`updateAvatar: ${error}`);
      throw error;
    }
  }

  async deleteAvatar(id: string) {
    try {
      await this.databaseService.runQuery(
        `
		UPDATE "user"
		SET avatar = null
		WHERE id = $1;
		`,
        [id],
      );
      return 200;
    } catch (error) {
      this.logger.error(`deleteAvatar: ${error}`);
      throw error;
    }
  }

  async updateTwofactor(id: string, twofactor: boolean) {
    try {
      await this.databaseService.runQuery(
        `
		UPDATE "user"
		SET twofactor_status = $1
		WHERE id = $2;
		`,
        [twofactor, id],
      );
      return 200;
    } catch (error) {
      this.logger.error(`updateTwofactor: ${error}`);
      throw error;
    }
  }

  async getFollows(id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		SELECT partner_id
		FROM "user_relation"
		WHERE user_id=$1 AND block_status=false;
		`,
        [id],
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
		WHERE winner_id=$1 OR loser_id=$1
		ORDER BY id DESC
		LIMIT 5;
		`,
        [id],
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
		WHERE winner_id=$1;
		`,
        [id],
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
		WHERE loser_id=$1;
		`,
        [id],
      );
      return loses;
    } catch (error) {
      this.logger.error(`[${this.getLoseHistory.name}] ${error}`);
      throw error;
    }
  }
}
