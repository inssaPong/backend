import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import {
  ChannelMemberTableDto,
  ChannelDto as ChannelDto,
} from './dto/repository-channels.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly logger = new Logger(ChannelsRepository.name);

  // Description: 채널 생성
  async insertChannel(channel_name: string, channel_pw: string): Promise<void> {
    this.logger.log(`[${this.insertChannel.name}]`);
    try {
      await this.databaseService.runQuery(
        `
        INSERT INTO "channel" (name, password)
        VALUES ('${channel_name}', '${channel_pw}');
        `,
      );
    } catch (error) {
      this.logger.error(`${error} in "${error.table}" table`);
      throw new InternalServerErrorException();
    }
  }

  // Description: 채널 이름을 통해 채널 ID를 가져오기
  async getChannelIdByChannelName(channel_name: string): Promise<number> {
    this.logger.log(`[${this.getChannelIdByChannelName.name}]`);
    try {
      const databaseResponse: ChannelDto[] =
        await this.databaseService.runQuery(
          `
        SELECT id FROM "channel"
        WHERE name='${channel_name}';
        `,
        );
      return databaseResponse[0].id;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  // Description: 채널 ID를 통해 채널 이름을 가져오기
  async getChannelNameByChannelId(channel_id: number): Promise<string> {
    this.logger.log(`[${this.getChannelNameByChannelId.name}]`);
    try {
      const databaseResponse: ChannelDto[] =
        await this.databaseService.runQuery(
          `
        SELECT name FROM "channel"
        WHERE id='${channel_id}';
        `,
        );
      return databaseResponse[0].name;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  // Description: 채널 멤버에 추가 (Owner)
  async insertOwnerToChannelMember(
    user_id: string,
    channel_id: number,
  ): Promise<void> {
    this.logger.log(`[${this.insertOwnerToChannelMember.name}]`);
    try {
      await this.databaseService.runQuery(
        `
        INSERT INTO "channel_member" (user_id, channel_id, ban_status, authority)
        VALUES ('${user_id}', '${channel_id}', 'false', '1');
        `,
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  // Description: 채널 멤버에 추가 (Owner)
  async insertGuestToChannelMember(
    user_id: string,
    channel_id: number,
  ): Promise<void> {
    try {
      this.logger.log(`[${this.insertGuestToChannelMember.name}]`);
      await this.databaseService.runQuery(
        `
        INSERT INTO "channel_member" (user_id, channel_id, ban_status, authority)
        VALUES ('${user_id}', '${channel_id}', 'false', '3');
        `,
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  // Description: 채널 목록 가져오기
  async getAllChannelListIncludePrivate(): Promise<ChannelDto[]> {
    this.logger.log(`[${this.getAllChannelListIncludePrivate.name}]`);
    try {
      const databaseResponse: ChannelDto[] =
        await this.databaseService.runQuery(
          `
        SELECT id, name, password FROM "channel";
        `,
        );
      return databaseResponse;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  // Description: 참여 중인 채널인지 확인
  async isJoinedChannel(user_id: string, channel_id: number): Promise<boolean> {
    this.logger.log(`[${this.isJoinedChannel.name}]`);
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
        SELECT channel_id FROM "channel_member"
        WHERE user_id='${user_id}' AND channel_id='${channel_id}';
        `,
        );
      return databaseResponse.length === 0 ? false : true;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  // Description: 유저 ID를 통해 참가 중인 채널 아이디 목록 가져오기
  async getJoinedChannelIdListByUserId(
    user_id: string,
  ): Promise<ChannelMemberTableDto[]> {
    this.logger.log(`[${this.getJoinedChannelIdListByUserId.name}]`);
    try {
      const databaseResopnse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
        SELECT channel_id FROM "channel_member"
        WHERE user_id='${user_id}';
        `,
        );
      return databaseResopnse;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  // Description: 접근하려는 채널의 밴 여부 확인
  async isBannedChannel(user_id: string, channel_id: number): Promise<boolean> {
    this.logger.log(`[${this.isBannedChannel.name}]`);
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
        SELECT ban_status FROM "channel_member"
        WHERE user_id='${user_id}' AND channel_id='${channel_id}';
        `,
        );
      if (databaseResponse.length === 0) {
        return false;
      }
      return databaseResponse[0].ban_status;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  // Description: 채널 비밀번호 유효성 검사.
  async isValidChannelPassword(
    channel_id: number,
    input_pw: string,
  ): Promise<boolean> {
    this.logger.log(`[${this.isValidChannelPassword.name}]`);
    try {
      const databaseResponse: ChannelDto[] =
        await this.databaseService.runQuery(
          `
        SELECT password FROM "channel"
        WHERE id='${channel_id}';
        `,
        );
      const password = databaseResponse[0].password;
      if (password) {
        const isValidPw = await bcrypt.compare(input_pw, password);
        return isValidPw;
      }
      return password === input_pw ? true : false;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getUserIdListInChannelMember(channel_id: number): Promise<Object[]> {
    this.logger.log(`[${this.getUserIdListInChannelMember.name}]`);
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
        SELECT user_id FROM "channel_member"
        WHERE channel_id='${channel_id}';
        `,
        );
      return databaseResponse;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getUserAuthorityFromChannel(
    user_id: string,
    channel_id: number,
  ): Promise<string> {
    this.logger.log(`[${this.getUserAuthorityFromChannel.name}]`);
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
        SELECT authority FROM "channel_member"
        WHERE user_id='${user_id}' AND channel_id='${channel_id}';
        `,
        );
      return databaseResponse[0].authority;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteAllMessageInChannel(channel_id: number): Promise<void> {
    this.logger.log(`[${this.deleteAllMessageInChannel.name}]`);
    try {
      await this.databaseService.runQuery(
        `
        DELETE FROM "message"
        WHERE channel_id='${channel_id}';
        `,
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteOneUserInChannelMember(
    user_id: string,
    channel_id: number,
  ): Promise<void> {
    this.logger.log(`[${this.deleteOneUserInChannelMember.name}]`);
    try {
      this.databaseService.runQuery(
        `
        DELETE FROM "channel_member"
        WHERE user_id='${user_id}' AND channel_id='${channel_id}';
        `,
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteAllUserInChannelMember(channel_id: number): Promise<void> {
    this.logger.log(`[${this.deleteAllUserInChannelMember.name}]`);
    try {
      await this.databaseService.runQuery(
        `
        DELETE FROM "channel_member"
        WHERE channel_id='${channel_id}';
        `,
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteChannel(channel_id: number): Promise<void> {
    this.logger.log(`[${this.deleteChannel.name}(channel_id)]`);
    try {
      await this.databaseService.runQuery(
        `
        DELETE FROM "channel"
        WHERE id='${channel_id}';
        `,
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  ///////////////////////////////////////////////////////////////////

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
