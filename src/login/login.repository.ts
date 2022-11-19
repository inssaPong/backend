import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UserDto } from './dto/repository-login.dto';

@Injectable()
export class LoginRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly logger = new Logger(LoginRepository.name);

  async insertUserData(user_id: string, nickname: string, email: string) {
    this.logger.log(`[${this.insertUserData.name}]`);
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

  async getUserData(user_id: string): Promise<UserDto> {
    this.logger.log(`[${this.getUserData.name}]`);
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
