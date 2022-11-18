import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import {
  ChannelMemberTableDto,
  ChannelTableDto,
} from './dto/repository-channels.dto';

@Injectable()
export class ChannelsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly logger = new Logger(ChannelsRepository.name);

  // Description: 채널 생성
  async insertChannel(channel_name: string, channel_pw: string): Promise<void> {
    try {
      await this.databaseService.runQuery(
        `
        INSERT INTO "channel" (name, password)
        VALUES ('${channel_name}', '${channel_pw}');
        `,
      );
    } catch (error) {
      this.logger.error(
        `[${this.insertChannel.name}] ${error} in "${error.table}" table`,
      );
      throw error;
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
      return databaseResponse[0].id;
    } catch (error) {
      this.logger.error(`[${this.getChannelIdByChannelName.name}] ${error}`);
      throw error;
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
      this.logger.error(`[${this.getChannelNameByChannelId.name}] ${error}`);
      throw error;
    }
  }

  // Description: 채널 멤버에 추가 (Owner)
  async insertOwnerToChannelMember(
    user_id: string,
    channel_id: number,
  ): Promise<void> {
    try {
      await this.databaseService.runQuery(
        `
        INSERT INTO "channel_member" (user_id, channel_id, ban_status, authority)
        VALUES ('${user_id}', '${channel_id}', 'false', '1');
        `,
      );
    } catch (error) {
      this.logger.error(`insertOwnerToChannelMember: ${error}`);
      throw error;
    }
  }

  // Description: 채널 멤버에 추가 (Owner)
  async insertGuestToChannelMember(
    user_id: string,
    channel_id: number,
  ): Promise<void> {
    try {
      await this.databaseService.runQuery(
        `
        INSERT INTO "channel_member" (user_id, channel_id, ban_status, authority)
        VALUES ('${user_id}', '${channel_id}', 'false', '3');
        `,
      );
    } catch (error) {
      this.logger.error(`insertGuestChannelMember: ${error}`);
      throw error;
    }
  }

  // Description: 전체 채널 목록 가져오기
  async getAllChannelListIncludePrivate(): Promise<ChannelTableDto[]> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT id, name, password FROM "channel";
        `,
      );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`getAllChannelList: ${error}`);
      throw error;
    }
  }

  // Description: 참여 중인 채널인지 확인
  async isJoinedChannel(user_id: string, channel_id: number): Promise<boolean> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT channel_id FROM "channel_member"
        WHERE user_id='${user_id}' AND channel_id='${channel_id}';
        `,
      );
      return databaseResponse.length === 0 ? false : true;
    } catch (error) {
      this.logger.error(`isJoinedChannel: ${error}`);
      throw error;
    }
  }

  // Description: 유저 ID를 통해 참가 중인 채널 아이디 목록 가져오기
  async getJoinedChannelIdListByUserId(user_id: string): Promise<Object[]> {
    try {
      let channelIdAndNameList = [];
      const channelIdList = await this.databaseService.runQuery(
        `
        SELECT channel_id FROM "channel_member"
        WHERE user_id='${user_id}';
        `,
      );

      // TODO: 수정. Service로 빼기
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
      this.logger.error(`[getJoinedChannelListByUserId] ${error}`);
      throw error;
    }
  }

  // Description: 접근하려는 채널의 밴 여부 확인
  async isBannedChannel(user_id: string, channel_id: number): Promise<boolean> {
    // 1. 밴 여부 확인
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT channel_id, ban_status FROM "channel_member"
        WHERE user_id='${user_id}';
        `,
      );
      for (const channelObject of databaseResponse) {
        if (channelObject.channel_id === channel_id) {
          const isBanned = channelObject.ban_status;
          if (isBanned === true) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      throw `isBannedChannel: ${error}`;
    }
  }

  // Description: 접근하려고 하는 채널의 비밀번호가 맞는지
  async isValidPasswordForChannel(
    channel_id: number,
    input_password: string,
  ): Promise<boolean> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT password FROM "channel" WHERE id='${channel_id}'
        `,
      );
      if (databaseResponse.length === 0) {
        return false;
      }
      const channelPassword = databaseResponse[0].password;
      if (channelPassword === input_password) {
        // TODO: 수정. 암호화 해서 비교하기 bcrypt 모듈 사용
        return true;
      }
      return false;
    } catch (error) {
      throw `isValidPasswordForChannel: ${error}`;
    }
  }

  async getUsersIdInChannelMember(channel_id: number): Promise<Object[]> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT user_id FROM "channel_member"
        WHERE channel_id='${channel_id}';
        `,
      );
      return databaseResponse;
    } catch (error) {
      throw `getUsersStatusInJoinedChannel: ${error}`;
    }
  }

  // Description: 채널 나가기
  async exitChannel(user_id: string, channel_id: number): Promise<boolean> {
    try {
      // Description: 내가 이 채널에서 어떤 권한을 가지고 있는지 확인
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT authority FROM "channel_member"
        WHERE user_id='${user_id}' AND channel_id='${channel_id}';
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
        WHERE user_id='${user_id}' AND channel_id='${channel_id}';
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

  ///////////////////////////////////////////////////////////////////

  async checkEnteredChannel(user_id: string, channel_id: number) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT user_id FROM "channel_member"
          WHERE user_id='${user_id}' AND channel_id=${channel_id};
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
			    SELECT user_id FROM "channel_member" WHERE channel_id=${channel_id};
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

  async getAuthority(user_id: string, channel_id: number): Promise<number> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT authority FROM "channel_member"
          WHERE user_id='${user_id}' AND channel_id='${channel_id}';
		    `,
      );
      return databaseResponse[0].authority;
    } catch (err) {
      this.logger.log(`[getAuthority] : ${err}`);
      return 500;
    }
  }

  async changeChannelPassword(id: number, password: string): Promise<number> {
    try {
      await this.databaseService.runQuery(
        `
          UPDATE "channel"
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
    user_id: string,
    channel_id: number,
    authority: number,
  ): Promise<number> {
    try {
      await this.databaseService.runQuery(
        `
          UPDATE "channel_member"
          SET authority = '${authority}'
          WHERE user_id='${user_id}' AND channel_id=${channel_id};
        `,
      );
      return 200;
    } catch (err) {
      this.logger.log(`[changeChannelAuthority] : ${err}`);
      return 500;
    }
  }

  async patchBanStatus(
    user_id: string,
    channel_id: number,
    ban_status: boolean,
  ): Promise<number> {
    try {
      await this.databaseService.runQuery(
        `
          UPDATE "channel_member"
          SET ban_status = ${ban_status}
          WHERE user_id='${user_id}' AND channel_id=${channel_id};
        `,
      );
      return 200;
    } catch (err) {
      this.logger.log(`[patchBanStatus] : ${err}`);
      return 500;
    }
  }

  async isUserExist(id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
				SELECT *
				FROM "user"
				WHERE id='${id}';
				`,
      );
      if (databaseResponse.length == 1) return 200;
      else return 404;
    } catch (err) {
      this.logger.error(`[isUserExist] : ${err}`);
      return 500;
    }
  }
}
