import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class LoginRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly logger = new Logger(LoginRepository.name);

  async insertUserDataInUser(user_id: string, nickname: string, email: string) {
    this.logger.log(`[${this.insertUserDataInUser.name}]`);
    try {
      await this.databaseService.runQuery(
        `
        INSERT INTO "user" (id, nickname, email)
        VALUES ('${user_id}', '${nickname}', '${email}');
        `,
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getUserDataInUser(user_id: string): Promise<any> {
    this.logger.log(`[${this.getUserDataInUser.name}]`);
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT * FROM "user"
        WHERE id='${user_id}';
        `,
      );
      return databaseResponse[0];
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }
}
