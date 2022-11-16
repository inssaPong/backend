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
  async createChannel(
    user_id: string,
    channel_name: string,
    channel_pw: string,
  ) {
    // TODO: dto 추가
    if (channel_name === '') {
      this.logger.error('유효하지 않은 채널 이름입니다.');
      throw new BadRequestException();
    }
    if (channel_pw.length !== 0 && channel_pw.length !== 4) {
      this.logger.error('유효하지 않은 채널 비밀번호입니다.');
      throw new BadRequestException();
    }

    // Description: 비밀번호 암호화
    if (channel_pw.length === 4) {
      const salt = await bcrypt.genSalt();
      channel_pw = await bcrypt.hash(channel_pw, salt);
    }

    // Description: 채널 생성
    try {
      await this.channelsRepository.inserNameAndPwIntoChannel(
        channel_name,
        channel_pw,
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }

    try {
      // Description: 생성된 채널 id 가져오기
      const channel_id =
        await this.channelsRepository.getChannelIdByChannelName(channel_name);
      this.logger.log(
        `생성된 채널 id를 가져오는데 성공했습니다: ${channel_id}`,
      );
      // Description: channel_member 테이블에 추가
      await this.channelsRepository.insertOwnerToChannelMember(
        user_id,
        channel_id,
      );
      this.logger.log('channel_member 테이블에 추가했습니다.');
      return {
        id: channel_id,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }
}
