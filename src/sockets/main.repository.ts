import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MainSocketRepository {
  private readonly logger: Logger = new Logger(MainSocketRepository.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async getUsers() {
    let databaseResponse: any[];
    try {
      databaseResponse = await this.databaseService.runQuery(
        `
		      SELECT id
		      FROM "user";
		    `,
      );
      return databaseResponse;
    } catch (err) {
      this.logger.log(err);
      return databaseResponse;
    }
  }
}
