import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ChannelsRepository } from './channels.repository';
import * as bcrypt from 'bcrypt';
import { MainGateway } from 'src/sockets/main.gateway';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly channelsRepository: ChannelsRepository,
    private readonly mainGateway: MainGateway,
  ) {}

  private readonly logger: Logger = new Logger(ChannelsService.name);

  // Description: 채널 생성
  async createChannelAndReturnChannelId(
    user_id: string,
    channel_name: string,
    channel_pw: string,
  ): Promise<number> {
    // TODO: dto 추가
    if (channel_name === '') {
      this.logger.error(
        `유효하지 않은 채널 이름입니다. 입력된 채널 이름: ${channel_name}`,
      );
      throw new BadRequestException();
    }
    if (channel_pw.length !== 0 && channel_pw.length !== 4) {
      this.logger.error(
        `유효하지 않은 채널 비밀번호입니다. 입력된 채널 비밀번호: ${channel_pw}`,
      );
      throw new BadRequestException();
    }

    // Description: 비밀번호 암호화
    if (channel_pw.length === 4) {
      const salt = await bcrypt.genSalt();
      channel_pw = await bcrypt.hash(channel_pw, salt);
    }

    try {
      // Description: 채널 생성
      await this.channelsRepository.insertChannel(channel_name, channel_pw);
      this.logger.log('channel 생성');

      // Description: 생성된 채널 id 가져오기
      const channelId = await this.channelsRepository.getChannelIdByChannelName(
        channel_name,
      );
      this.logger.log(`생성된 채널 id: ${channelId}`);

      // Description: channel_member 테이블에 추가
      await this.channelsRepository.insertOwnerToChannelMember(
        user_id,
        channelId,
      );
      this.logger.log('channel_member 테이블에 추가');

      return channelId;
    } catch (exception) {
      throw exception;
    }
  }

  // TODO: 수정. dto
  async getAvailableChannelList(user_id: string): Promise<Object[]> {
    try {
      const allChannelList =
        await this.channelsRepository.getAllChannelListIncludePrivate();
      if (allChannelList.length === 0) {
        this.logger.log('한 개의 채널도 존재하지 않습니다.');
        return [];
      }

      let availableChannelList = [];
      for (const channel of allChannelList) {
        const isJoinedChannel = await this.channelsRepository.isJoinedChannel(
          user_id,
          channel.id,
        );
        if (isJoinedChannel) {
          continue;
        }
        const hasPassword = channel.password ? true : false;
        availableChannelList.push({
          id: channel.id,
          name: channel.name,
          has_password: hasPassword,
        });
      }
      this.logger.log(
        `참여할 수 있는 ${availableChannelList.length} 개의 채널 목록을 가져옵니다: `,
      );
      return availableChannelList;
    } catch (exception) {
      throw exception;
    }
  }

  // TODO: 수정. dto
  async getJoinedChannelList(user_id: string): Promise<Object[]> {
    try {
      const joinedChannelIdList =
        await this.channelsRepository.getJoinedChannelIdListByUserId(user_id);

      // TODO: 수정. dto?
      let channelIdAndNameList = [];
      for (const channelObject of joinedChannelIdList) {
        if (channelObject.ban_status == true) continue;
        const channelName =
          await this.channelsRepository.getChannelNameByChannelId(
            channelObject.channel_id,
          );
        channelIdAndNameList.push({
          id: channelObject.channel_id,
          name: channelName,
        });
      }
      this.logger.log('참여 중인 채널 목록을 가져옵니다.');
      return channelIdAndNameList;
    } catch (exception) {
      throw exception;
    }
  }

  async enterChannel(
    user_id: string,
    channel_id: number,
    input_pw: string,
  ): Promise<void> {
    try {
      // Description: 밴 여부 확인
      const isBanned = await this.channelsRepository.isBannedChannel(
        user_id,
        channel_id,
      );
      if (isBanned) {
        this.logger.error(`밴 된 대상입니다.`);
        throw new HttpException(
          {
            status: HttpStatus.NO_CONTENT,
            error: 'No Conent',
          },
          HttpStatus.NO_CONTENT,
        );
      }

      // Description: 입력 받은 비밀번호 유효성 검사
      const isValidPw = await this.channelsRepository.isValidChannelPassword(
        channel_id,
        input_pw,
      );
      if (isValidPw === false) {
        this.logger.error('잘못된 채널 비밀번호입니다.');
        throw new ForbiddenException();
      }
      this.logger.log(`비밀번호 인증에 성공했습니다.`);
      // Description: DB channel_member 테이블에 추가
      await this.channelsRepository.insertGuestToChannelMember(
        user_id,
        channel_id,
      );
      this.logger.log(`${channel_id} 채널 입장에 성공했습니다.`);
      this.mainGateway.someoneEnterSocket(user_id, channel_id);
    } catch (exception) {
      throw exception;
    }
  }

  async getChannelName(channel_id: number): Promise<string> {
    try {
      const channelName =
        await this.channelsRepository.getChannelNameByChannelId(channel_id);
      this.logger.log(`채널 이름을 가져왔습니다: ${channelName}`);
      return channelName;
    } catch (exception) {
      throw exception;
    }
  }

  // TODO: 수정. dto
  async getUserIdListInChannel(channel_id: number): Promise<Object[]> {
    try {
      const userIdList =
        await this.channelsRepository.getUserIdListInChannelMember(channel_id);
      this.logger.log(
        `${userIdList.length}개의 유저 id 리스트를 가져왔습니다.`,
      );
      return userIdList;
    } catch (exception) {
      throw exception;
    }
  }

  // TODO: 에러. duplicate 에러가 떴던거 같은데.. Patch or Delete
  async exitChannel(user_id: string, channel_id: number) {
    try {
      // Description: 해당 채널에서 내 권한 정보 가져오기
      const authority =
        await this.channelsRepository.getUserAuthorityFromChannel(
          user_id,
          channel_id,
        );
      this.logger.log(
        `${channel_id} 채널의 내 권한을 가져왔습니다: ${authority}`,
      );

      // Description: channel_member 테이블에서 내가 입장한 channel_id를 삭제
      await this.channelsRepository.deleteOneUserInChannelMember(
        user_id,
        channel_id,
      );

      // Description: 내가 채널장인 경우
      if (authority === '1') {
        // Description: channel_id 채널의 메세지 내역 삭제
        await this.channelsRepository.deleteAllMessageInChannel(channel_id);
        this.logger.log(`${channel_id} 채널의 메세지 내역을 삭제했습니다.`);

        // Description: channel_id 채널에 참여 중인 유저 정보 삭제
        await this.channelsRepository.deleteAllUserInChannelMember(channel_id);
        this.logger.log(
          `${channel_id} 채널에 참여 중인 유저 정보 삭제했습니다.`,
        );

        // Description: 채널 제거
        await this.channelsRepository.deleteChannel(channel_id);
        this.logger.log(`${channel_id} 채널 삭제에 성공했습니다.`);
      }
      this.mainGateway.someoneExitSocket(user_id, channel_id);
    } catch (exception) {
      throw exception;
    }
  }
}
