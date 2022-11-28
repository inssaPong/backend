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

  async insertUserData(
    user_id: string,
    nickname: string,
    email: string,
    avatar: string,
  ) {
    this.logger.log(`[${this.insertUserData.name}]`);
    try {
      await this.databaseService.runQuery(
        `
          INSERT INTO "user" (id, nickname, email, avatar)
          VALUES ($1, $2, $3, NULLIF($4, '')::bytea);
        `,
        [user_id, nickname, email, avatar],
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getTwoFactorStatusByUserId(user_id: string): Promise<boolean> {
    this.logger.log(`[${this.getTwoFactorStatusByUserId.name}]`);
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT * FROM "user"
          WHERE id=$1;
        `,
        [user_id],
      );
      if (databaseResponse.length === 0) {
        this.logger.error(`해당 유저가 존재하지 않습니다.`);
        return false;
      }
      return databaseResponse[0].twofactor_status;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async isUserExistInDB(user_id: string): Promise<boolean> {
    this.logger.log(`[${this.isUserExistInDB.name}]`);
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT id FROM "user"
          WHERE id='${user_id}';
        `,
      );
      if (databaseResponse.length === 0) {
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }
}
