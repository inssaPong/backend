import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ChannelsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async checkPossibleChannel(id: string, channel_id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT id FROM "channel_member"
          WHERE id=${id} AND channel_id=${channel_id};
		    `,
      );
      if (databaseResponse.length == 1) return 200;
      else return 400;
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.log('[ChannelDB]insertMessage : ' + error);
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
    } catch (error) {
      console.log('[ChannelDB]insertDM : ' + error);
      return 500;
    }
  }
}
