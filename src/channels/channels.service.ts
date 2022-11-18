import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ChannelsRepository } from './channels.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelsService {
  constructor(private readonly channelsRepository: ChannelsRepository) {}

  private readonly logger: Logger = new Logger(ChannelsService.name);

  // Description: 채널 생성
  async createChannelAndReturnChannelId(
    user_id: string,
    channel_name: string,
    channel_pw: string,
  ): Promise<number> {
    this.logger.log(`Function: ${this.createChannelAndReturnChannelId.name}`);

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
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // TODO: 수정. dto
  async GetAvailableChannelList(user_id: string): Promise<Object[]> {
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
    } catch (error) {
      throw new InternalServerErrorException();
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
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
