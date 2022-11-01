import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class LoginRepository {
  constructor(private readonly databaseService: DatabaseService) {}
  async createUser(id: string, nickname: string, email: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
				INSERT INTO "user" (id, nickname, email)
				VALUES ('${id}', '${nickname}', '${email}');
				`,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
