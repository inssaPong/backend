import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ChannelsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly logger = new Logger(ChannelsRepository.name);

  // Description: 채널 생성
  async createChannel(channel: any): Promise<void> {
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

  // Description: 채널 이름을 통해 채널 ID를 가져오기
  async getChannelIdByChannelName(channel_name: string): Promise<number> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT id FROM "channel"
        WHERE name='${channel_name}';
        `,
      );
      const channelId = databaseResponse[0].id;
      this.logger.debug(`channel_id: ${channelId}`);
      return channelId;
    } catch (error) {
      throw `getChannelIdByChannelName: ${error}`;
    }
  }

  // Description: 채널 ID를 통해 채널 이름을 가져오기
  async getChannelNameByChannelId(channel_id: number): Promise<string> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT name FROM "channel"
        WHERE id='${channel_id}';
        `,
      );
      return databaseResponse[0].name;
    } catch (error) {
      throw `getChannelNameByChannelId: ${error}`;
    }
  }

  // Description: 유저 ID를 통해 참가 중인 채널 목록 가져오기
  async getJoinedChannelListByUserId(user_id: string): Promise<Object[]> {
    try {
      let channelIdAndNameList = [];
      const channelIdList = await this.databaseService.runQuery(
        `
        SELECT channel_id FROM "channel_member"
        WHERE id='${user_id}';
        `,
      );

      for (const channelObject of channelIdList) {
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

  // Description: 채널 멤버에 추가 (채널 생성)
  async insertAdminToChannelMember(
    user_id: string,
    channel_id: number,
  ): Promise<void> {
    try {
      const databaseResponse = this.databaseService.runQuery(
        `
        INSERT INTO "channel_member" (id, channel_id, ban_status, mute_status, authority)
        VALUES ('${user_id}', '${channel_id}', 'false', 'false', '1');
        `,
      );
    } catch (error) {
      throw `insertChannelMember: ${error}`;
    }
  }

  // Description: 전체 채널 목록 가져오기
  async getAllChannelList(): Promise<Object[]> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT id, name, password FROM "channel";
        `,
      );
      const channels = databaseResponse;
      return channels;
    } catch (error) {
      throw `getAllChannelList: ${error}`;
    }
  }

  // Description: 참여 중인 채널인지 확인
  async isJoinedChannel(user_id: string, channel_id: number): Promise<boolean> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT channel_id FROM "channel_member"
        WHERE id='${user_id}' AND channel_id='${channel_id}';
        `,
      );
      if (databaseResponse.length === 0) {
        return false;
      }
      return true;
    } catch (error) {
      throw `isJoinedChannel: ${error}`;
    }
  }

  // Description: 참여할 수 있는 채널 리스트 반환. name, has_password
  async getAvailableChannelList(user_id: string): Promise<Object[]> {
    let allChannel;
    // Description: 전체 채널 리스트 가져오기
    try {
      allChannel = await this.getAllChannelList();
      if (allChannel.length === 0) {
        this.logger.log('한 개의 채널도 존재하지 않습니다.');
        return [];
      }
    } catch (error) {
      throw `getAccessibleChannelList: ${error}`;
    }

    // Description: 전체 채널 리스트에서 참여 중인 채널을 제외한 채널들 반환
    try {
      let availableChannelList = [];
      for (const channel of allChannel) {
        const isJoinedChannel = await this.isJoinedChannel(user_id, channel.id);
        if (isJoinedChannel === false) {
          let hasPassword = true;
          if (channel.password === '') {
            hasPassword = false;
          }
          availableChannelList.push({
            id: channel.id,
            name: channel.name,
            has_password: hasPassword,
          });
        }
      }
      return availableChannelList;
    } catch (error) {
      throw `getAvailableChannelList: ${error}`;
    }
  }

  // Description: 채널 나가기
  async exitChannel(user_id: string, channel_id: number): Promise<boolean> {
    try {
      // Description: 내가 이 채널에서 어떤 권한을 가지고 있는지 확인
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT authority FROM "channel_member"
        WHERE id='${user_id}' AND channel_id='${channel_id}';
        `,
      );
      if (databaseResponse.length === 0) {
        return false;
      }
      const authority = databaseResponse[0].authority;

      // Description: channel_member 테이블에서 내가 입장한 channel_id를 삭제
      await this.databaseService.runQuery(
        `
        DELETE FROM "channel_member"
        WHERE id='${user_id}' AND channel_id='${channel_id}';
        `,
      );

      // Description: 내가 채널장인 경우 channel_member 테이블에서 해당 채널 모두 삭제. channel 테이블에서 채널 삭제
      if (authority === '1') {
        await this.databaseService.runQuery(
          `
          DELETE FROM "channel_member"
          WHERE channel_id='${channel_id}';
          `,
        );

        await this.databaseService.runQuery(
          `
          DELETE FROM "channel"
          WHERE id='${channel_id}';
          `,
        );
      }
      return true;
    } catch (error) {
      throw `exitChannel: ${error}`;
    }
  }

  async checkEnteredChannel(id: string, channel_id: number) {
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
      this.logger.log(`[checkEnteredChannel] : ${err}`);
      return 500;
    }
  }

  async getRoomMembers(channel_id: number) {
    // todo any 형식 dto로 변경
    let databaseResponse: any[];
    try {
      databaseResponse = await this.databaseService.runQuery(
        `
			    SELECT id FROM "channel_member" WHERE channel_id=${channel_id};
		    `,
      );
      return databaseResponse;
    } catch (err) {
      this.logger.log(`[getRoomMembers] : ${err}`);
      return databaseResponse;
    }
  }

  async insertChannelMessage(
    channel_id: string,
    sender_id: string,
    content: string,
  ) {
    try {
      await this.databaseService.runQuery(
        `
			    INSERT INTO "message" (channel_id, sender_id, content)
			    VALUES ('${channel_id}', '${sender_id}', '${content}');
		    `,
      );
      return 201;
    } catch (err) {
      this.logger.log(`[insertChannelMessage] : ${err}`);
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
      this.logger.log(`[insertDM] : ${err}`);
      return 500;
    }
  }

  async getAllMessage(channel_id: number) {
    // todo any 형식 dto로 변경
    let databaseResponse: any[];
    try {
      databaseResponse = await this.databaseService.runQuery(
        `
          SELECT * FROM "message" WHERE channel_id=${channel_id};
		    `,
      );
      return databaseResponse;
    } catch (err) {
      this.logger.log(`[getAllMessage] : ${err}`);
      return databaseResponse;
    }
  }

  async isBlockedUser(user_id: string, partner_id: string) {
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
        return 200;
      else return 400;
    } catch (err) {
      this.logger.log(`[isBlockedUser] : ${err}`);
      return 500;
    }
  }

  async getAuthority(id: string, channel_id: number): Promise<number> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT authority FROM "channel_member"
          WHERE id='${id}' AND channel_id='${channel_id}';
		    `,
      );
      if (databaseResponse.length == 1) return databaseResponse[0].authority;
      else return 400;
    } catch (err) {
      this.logger.log(`[getAuthority] : ${err}`);
      return 500;
    }
  }

  async changeChannelPassword(id: number, password: string): Promise<number> {
    try {
      await this.databaseService.runQuery(
        `
          UPDATE "user"
          SET password = '${password}'
          WHERE id=${id};
        `,
      );
      return 200;
    } catch (err) {
      this.logger.log(`[changeChannelPassword] : ${err}`);
      return 500;
    }
  }

  async changeChannelAuthority(
    id: string,
    channel_id: number,
    authority: number,
  ): Promise<number> {
    try {
      await this.databaseService.runQuery(
        `
          UPDATE "channel_member"
          SET authority = '${authority}'
          WHERE id='${id}' AND channel_id=${channel_id};
        `,
      );
      return 200;
    } catch (err) {
      this.logger.log(`[changeChannelAuthority] : ${err}`);
      return 500;
    }
  }
}
