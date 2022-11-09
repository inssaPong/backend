import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ChannelsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async insertChannel(id: string, channel_id: string) {
    try {
      await this.databaseService.runQuery(
        `
			    INSERT INTO "channel_member" (id, channel_id)
			    VALUES ('${id}', '${channel_id}');
		    `,
      );
      return 201;
    } catch (error) {
      console.log('[ChannelDB]insertChannel : ' + error);
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
      console.log('[ChannelDB]selectRoomMember : ' + error);
      return databaseResponse;
    }
  }
}
