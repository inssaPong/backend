import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ChannelsRepository {
  private readonly logger = new Logger(ChannelsRepository.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async checkPossibleChannel(id: string, channel_id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT id FROM "channel_member"
          WHERE id='${id}' AND channel_id=${channel_id};
		    `,
      );
      if (databaseResponse.length == 1) return 200;
      else return 400;
    } catch (err) {
      this.logger.log(`[checkPossibleChannel] ${err}`);
      return 500;
    }
  }

  async selectRoomMember(channel_id: string) {
    let databaseResponse: any[];
    try {
      databaseResponse = await this.databaseService.runQuery(
        `
			    SELECT id FROM "channel_member" WHERE channel_id=${channel_id};
		    `,
      );
      return databaseResponse;
    } catch (err) {
      this.logger.log(`[selectRoomMember] ${err}`);
      return databaseResponse;
    }
  }

  async insertMessage(channel_id: string, sender_id: string, content: string) {
    try {
      await this.databaseService.runQuery(
        `
			    INSERT INTO "message" (channel_id, sender_id, content)
			    VALUES ('${channel_id}', '${sender_id}', '${content}');
		    `,
      );
      return 201;
    } catch (err) {
      this.logger.log(`[insertMessage] ${err}`);
      return 500;
    }
  }

  async insertDM(sender_id: string, receive_id: string, content: string) {
    try {
      await this.databaseService.runQuery(
        `
			    INSERT INTO "message" (sender_id, receive_id, content)
			    VALUES ('${sender_id}', '${receive_id}', '${content}');
		    `,
      );
      return 201;
    } catch (err) {
      this.logger.log(`[insertDM] ${err}`);
      return 500;
    }
  }

  async selectAllMessage(channel_id: string) {
    let databaseResponse: any[];
    try {
      databaseResponse = await this.databaseService.runQuery(
        `
          SELECT * FROM "message" WHERE channel_id=${channel_id};
		    `,
      );
      return databaseResponse;
    } catch (err) {
      this.logger.log(`[selectAllMessage] ${err}`);
      return databaseResponse;
    }
  }

  async selectBlockUser(user_id: string, partner_id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT block_status FROM "user_relation"
          WHERE user_id='${user_id}' AND partner_id='${partner_id}';
		    `,
      );
      if (
        databaseResponse.length == 1 &&
        databaseResponse[0].block_status == true
      )
        return true;
      else return false;
    } catch (err) {
      this.logger.log(`[selectBlockUser] ${err}`);
      return 500;
    }
  }
}
