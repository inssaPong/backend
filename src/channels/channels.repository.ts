import { Injectable, Logger } from '@nestjs/common';
import { channel } from 'diagnostic_channel';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ChannelsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly logger = new Logger(ChannelsRepository.name);

  async createChannel(channel: any) {
    // TODO: dto
    try {
      await this.databaseService.runQuery(
        `
        INSERT INTO "channel" (name, password)
        VALUES ('${channel.name}', '${channel.password}');
        `,
      );
    } catch (error) {
      throw `createChannel: ${error}`;
    }
  }

  async getChannelIdByChannelName(channel_name: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT id FROM "channel" WHERE name='${channel_name}';
        `,
      );
      const channelId: number = databaseResponse[0].id;
      this.logger.debug(`channel_id: ${channelId}`);
      return channelId;
    } catch (error) {
      throw `findChannelId: ${error}`;
    }
  }

  async getChannelNameByChannelId(channel_id: number): Promise<string> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT name FROM "channel" WHERE id='${channel_id}'
        `,
      );
      return databaseResponse[0].name;
    } catch (error) {
      throw `getChannelNameByChannelId: ${error}`;
    }
  }

  async insertChannelMember(user_id: string, channel_id: number) {
    try {
      const databaseResponse = this.databaseService.runQuery(
        `
        INSERT INTO "channel_member" (id, channel_id, ban_status, mute_status, authority)
        VALUES ('${user_id}', '${channel_id}', 'false', 'false', 1);
        `,
      );
    } catch (error) {
      throw `insertChannelMember: ${error}`;
    }
  }

  async getChannelList() {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT * FROM "channel" 
        `,
      );
      const channels = databaseResponse;
      this.logger.debug(`channels: ${channels}`);
      return channels;
    } catch (error) {
      throw `getAllChannelList: ${error}`;
    }
  }

  async getJoinedChannelListByUserId(user_id: string) {
    try {
      let channelIdAndNameList = [];
      const channelIdList = await this.databaseService.runQuery(
        `
        SELECT channel_id FROM "channel_member" WHERE id='${user_id}';
        `,
      );

      for (let channelObject of channelIdList) {
        const channelName = await this.getChannelNameByChannelId(
          channelObject.channel_id,
        );
        channelIdAndNameList.push({
          id: channelObject.channel_id,
          name: channelName,
        });
      }
      return channelIdAndNameList;
    } catch (error) {
      throw `getJoinedChannelList: ${error}`;
    }
  }

  async isJoinedChannel(user_id: string, channel_id: number): Promise<boolean> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT channel_id FROM "channel_member" WHERE id='${user_id}'
        `,
      );
      for (const channelObject of databaseResponse) {
        if (channelObject.channel_id === channel_id) {
          return true;
        }
      }
      return false;
    } catch (error) {
      throw `isJoinedChannel: ${error}`;
    }
  }
}
