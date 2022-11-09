import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MainSocketRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getUsers() {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		      SELECT id
		      FROM "user";
		    `,
      );
      return databaseResponse;
    } catch (error) {
      return;
    }
  }
}
