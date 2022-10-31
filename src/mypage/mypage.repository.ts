import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MypageRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getUserInfo(id: string) {
    const databaseResponse = await this.databaseService.runQuery(
      `
	SELECT
	user.nickname,
	user.email,
	user.twoFactor_status,
	user.avatar,
	FROM user
	WHERE user.id = $1
	`,
      [id],
    );
    return databaseResponse.rows;
  }
}
