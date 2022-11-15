import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class LoginRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  logger = new Logger(LoginRepository.name);

  async insertUser(id: string, nickname: string, email: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        INSERT INTO "user" (id, nickname, email)
        VALUES ('${id}', '${nickname}', '${email}');
        `,
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  async findUser(id: string): Promise<any> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT * FROM "user" WHERE id='${id}';
        `,
      );
      const user = databaseResponse[0];
      return user;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
