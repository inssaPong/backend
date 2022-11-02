import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MypageRepository {
  private readonly logger = new Logger(MypageRepository.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async getUserInfo(id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		SELECT nickname, avatar, twofactor_status
		FROM "user"
		WHERE id='${id}';
		`,
      );
      return;
      if (databaseResponse.length <= 0) return '404 Not Found'; // TODO status code 뱉는 걸로 바꾸기
      return databaseResponse;
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      return 404;
    }
  }

  async patchAvatar(id: string, avatar: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
		UPDATE "user"
		SET avatar = '${avatar}'
		WHERE id='${id}';
		`,
      );
      this.logger.debug(`database response length: ${databaseResponse.length}`);
      if (databaseResponse.length <= 0) return '404 Not Found'; // TODO status code 뱉는 걸로 바꾸기
      return databaseResponse;
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      return 404;
    }
  }
}
