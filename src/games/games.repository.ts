import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class GamesRepository {
  private readonly logger: Logger = new Logger(GamesRepository.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async insertGameHistory(winner_id: string, loser_id: string) {
    try {
      await this.databaseService.runQuery(
        `
          INSERT INTO "game_history" (winner_id, loser_id)
          VALUES ($1, $2);
        `,
        [winner_id, loser_id],
      );
      return 201;
    } catch (error) {
      this.logger.log('[insertGameHistory] : ' + error);
      return 500;
    }
  }
}
