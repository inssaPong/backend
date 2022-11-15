import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async findUser(id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
				SELECT *
				FROM "user"
				WHERE id='${id}';
				`,
      );
      if (databaseResponse.length == 1) return 200;
      else throw 404;
    } catch (error) {
      this.logger.error(`findUser: ${error}`);
      throw error;
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
      this.logger.error(`getGameHistory: ${error}`);
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
      this.logger.error(`getWinHistory: ${error}`);
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
      this.logger.error(`getLoseHistory: ${error}`);
      throw error;
    }
  }

  async getUserInfo(id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		  SELECT nickname, avatar
		  FROM "user"
		  WHERE id='${id}';
		  `,
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
				WHERE user_id = '${user_id}' AND partner_id = '${partner_id}' AND block_status = false;
				`,
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
				WHERE user_id = '${user_id}' AND partner_id = '${partner_id}' AND block_status = true;
				`,
      );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`getFollowStatus: ${error}`);
      throw error;
    }
  }

  async onFollowStatus(user_id: string, partner_id: string) {
    try {
      const checkBlock = await this.getBlockStatus(user_id, partner_id);
      if (checkBlock.length == 1) {
        await this.databaseService.runQuery(
          `
				UPDATE "user_relation"
				SET block_status = false
				WHERE user_id = '${user_id}' AND partner_id = '${partner_id}';
				`,
        );
      } else if (checkBlock.length == 0) {
        await this.databaseService.runQuery(
          `
					INSERT INTO "user_relation" (user_id, partner_id)
					VALUES ('${user_id}', '${partner_id}');
					`,
        );
      } else {
        throw new Error(`Invalid checkBlock length: ${checkBlock.length}`);
      }
      return 200;
    } catch (error) {
      this.logger.error(`onFollowStatus: ${error}`);
      throw error;
    }
  }

  async offFollowStatus(user_id: string, partner_id: string) {
    try {
      this.databaseService.runQuery(
        `
				DELETE FROM "user_relation"
				WHERE user_id = '${user_id}' AND partner_id = '${partner_id}';
				`,
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
				SELECT partner_id
				FROM "user_relation"
				WHERE user_id = '${user_id}' AND partner_id = '${partner_id}';
				`,
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
				WHERE user_id = '${user_id}' AND partner_id = '${block_id}' AND block_status != true
				`,
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
				VALUES ('${user_id}', '${block_id}', true);
				`,
      );
    } catch (error) {
      this.logger.error(`blockUnfollow: ${error}`);
      throw error;
    }
  }
}