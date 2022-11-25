import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async findUser(user_id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		SELECT *
		FROM "user"
		WHERE id = $1;
		`,
        [user_id],
      );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`findUser: ${error}`);
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
      this.logger.error(`getGameHistory: ${error}`);
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
      this.logger.error(`getWinHistory: ${error}`);
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
      this.logger.error(`getLoseHistory: ${error}`);
      throw error;
    }
  }

  async getUserInfo(user_id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		SELECT id, nickname, avatar
		FROM "user"
		WHERE id=$1;
		`,
        [user_id],
      );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`getUserInfo: ${error}`);
      throw error;
    }
  }

  async getFollowStatus(user_id: string, partner_id: string) {
    try {
      const databaseResponse = this.databaseService.runQuery(
        `
		SELECT *
		FROM "user_relation"
		WHERE user_id = $1 AND partner_id = $2 AND block_status = false;
		`,
        [user_id, partner_id],
      );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`getFollowStatus: ${error}`);
      throw error;
    }
  }

  async getBlockStatus(user_id: string, partner_id: string) {
    try {
      const databaseResponse = this.databaseService.runQuery(
        `
		SELECT *
		FROM "user_relation"
		WHERE user_id = $1 AND partner_id = $2 AND block_status = true;
		`,
        [user_id, partner_id],
      );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`getFollowStatus: ${error}`);
      throw error;
    }
  }

  async updateFollowStatus(user_id: string, partner_id: string) {
    try {
      await this.databaseService.runQuery(
        `
		UPDATE "user_relation"
		SET block_status = false
		WHERE user_id = $1 AND partner_id = $2;
		`,
        [user_id, partner_id],
      );
    } catch (error) {
      this.logger.error(`updateFollowStatus: ${error}`);
      throw error;
    }
  }

  async insertFollowStatus(user_id: string, partner_id: string) {
    try {
      await this.databaseService.runQuery(
        `
		INSERT INTO "user_relation" (user_id, partner_id)
		VALUES ($1, $2);
		`,
        [user_id, partner_id],
      );
    } catch (error) {
      this.logger.error(`insertFollowStatus: ${error}`);
      throw error;
    }
  }

  async offFollowStatus(user_id: string, partner_id: string) {
    try {
      this.databaseService.runQuery(
        `
		DELETE FROM "user_relation"
		WHERE user_id = $1 AND partner_id = $2;
		`,
        [user_id, partner_id],
      );
      return 200;
    } catch (error) {
      this.logger.error(`offFollowStatus: ${error}`);
      throw error;
    }
  }

  async getRelationStatus(user_id: string, partner_id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		SELECT block_status
		FROM "user_relation"
		WHERE user_id = $1 AND partner_id = $2;
		`,
        [user_id, partner_id],
      );
      if (databaseResponse.length != 1 && databaseResponse.length != 0)
        throw 500;
      return databaseResponse;
    } catch (error) {
      this.logger.error(`getRelationStatus: ${error}`);
      throw error;
    }
  }

  async blockFollow(user_id: string, block_id: string) {
    try {
      await this.databaseService.runQuery(
        `
		UPDATE "user_relation"
		SET block_status = true
		WHERE user_id = $1 AND partner_id = $2 AND block_status != true
		`,
        [user_id, block_id],
      );
    } catch (error) {
      this.logger.error(`blockFolow: ${error}`);
      throw error;
    }
  }

  async blockUnfollow(user_id: string, block_id: string) {
    try {
      await this.databaseService.runQuery(
        `
		INSERT INTO "user_relation" (user_id, partner_id, block_status)
		VALUES ($1, $2, true);
		`,
        [user_id, block_id],
      );
    } catch (error) {
      this.logger.error(`blockUnfollow: ${error}`);
      throw error;
    }
  }
}
