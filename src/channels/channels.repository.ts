import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ChannelsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  logger = new Logger(ChannelsRepository.name);

  async createChannel(channel_name: string, channel_pw: string) {
    try {
      await this.databaseService.runQuery(
        `
        INSERT INTO "channel" (name, password)
        VALUES ('${channel_name}', '${channel_pw}');
        `,
      );
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async findChannelId(channel_name: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT id FROM "channel" WHERE name='${channel_name}';
        `,
      );
      const channel_id = databaseResponse[0].id;
      this.logger.debug(`channel_id: ${channel_id}`);
      return channel_id;
    } catch (error) {
      this.logger.error(error);
      return -1;
    }
  }

  async getAllChannelList() {
    try {
    } catch (error) {
      this.logger.error(error);
    }
  }
}
