import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MypageRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getUserInfo(id: string) {
    const databaseResponse = await this.databaseService.runQuery(
      `
	SELECT *
	FROM "user"
	WHERE id='${id}';
	`,
    );
    return databaseResponse;
  }
}
