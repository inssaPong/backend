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
      throw `findChannelId: ${error}`;
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

  // Description: 채널 멤버에 추가 (채널 생성 or 채널 입장)
  async insertChannelMember(
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
  async getChannelList(): Promise<Object[]> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT * FROM "channel";
        `,
      );
      const channels = databaseResponse;
      this.logger.debug(`channels: ${channels}`);
      return channels;
    } catch (error) {
      throw `getAllChannelList: ${error}`;
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

  // Description: 참가 중인 채널인지 확인
  // async isJoinedChannel(user_id: string, channel_id: number): Promise<boolean> {
  //   try {
  //     const databaseResponse = await this.databaseService.runQuery(
  //       `
  //       SELECT channel_id FROM "channel_member"
  //       WHERE id='${user_id}' AND channel_id='${channel_id}';
  //       `,
  //     );
  //     if (databaseResponse.length === 0) {
  //       return false;
  //     }
  //     return true;
  //   } catch (error) {
  //     throw `isJoinedChannel: ${error}`;
  //   }
  // }

  // Description: 접근하려는 채널의 밴 여부 확인
  // async isBannedChannel(user_id: string, channel_id: number): Promise<boolean> {
  //   // 1. 밴 여부 확인
  //   try {
  //     const databaseResponse = await this.databaseService.runQuery(
  //       `
  //       SELECT channel_id, ban_status FROM "channel_member"
  //       WHERE id='${user_id}';
  //       `,
  //     );
  //     for (const channelObject of databaseResponse) {
  //       if (channelObject.channel_id === channel_id) {
  //         const isBanned = channelObject.ban_status;
  //         if (isBanned === true) {
  //           return true;
  //         }
  //       }
  //     }
  //     return false;
  //   } catch (error) {
  //     throw `isBannedChannel: ${error}`;
  //   }
  // }

  // Description: 접근하려고 하는 채널의 비밀번호가 맞는지
  // async isValidPasswordForChannel(
  //   channel_id: number,
  //   input_password: string,
  // ): Promise<boolean> {
  //   try {
  //     const databaseResponse = await this.databaseService.runQuery(
  //       `
  //       SELECT password FROM "channel"
  //       WHERE id='${channel_id}';
  //       `,
  //     );
  //     if (databaseResponse.length === 0) {
  //       return false;
  //     }
  //     const channelPassword = databaseResponse[0].password;
  //     if (channelPassword === input_password) {
  //       // TODO: 수정. 암호화 해서 비교하기 bcrypt 모듈 사용
  //       return true;
  //     }
  //     return false;
  //   } catch (error) {
  //     throw `isValidPasswordForChannel: ${error}`;
  //   }
  // }

  async exitChannel(user_id: string, channel_id: number): Promise<boolean> {
    try {
      // Description: 내가 이 채널에서 어떤 권한을 가지고 있는지 확인
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT channel_id, authority FROM "channel_member"
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
