import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MainGateway } from 'src/sockets/main.gateway';
import { UserStatus } from 'src/sockets/user.component';
import {
  CHANNELAUTHORITY,
  CHANNELCOMMAND,
  MUTETIME,
} from './channels.component';
import { ChannelsRepository } from './channels.repository';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';

@WebSocketGateway({ cors: true })
export class ChannelGateway {
  mute_users: string[] = [];
  private readonly logger: Logger = new Logger(ChannelGateway.name);
  constructor(
    private mainGateway: MainGateway,
    private channelsRepository: ChannelsRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @SubscribeMessage('channel/checkEntered')
  async checkEntered(client: Socket, data: string) {
    const req = JSON.parse(data);
    const status_code = await this.channelsRepository.checkEnteredChannel(
      req.user_id,
      req.channel_id,
    );
    if (status_code == 400) {
      client.emit('channel/checkEnteredFail');
      return;
    }
    if (status_code == 500) {
      client.emit('DBError');
      return;
    }
    this.sendPreviousMessage(client, req.user_id, req.channel_id);
  }

  @SubscribeMessage('channel/send')
  async sendMessage(client: Socket, data: string) {
    const req = JSON.parse(data);

    if (req.channel_id != undefined) {
      this.sendMessageToChannel(client, req);
    } else if (req.receive_id != undefined) {
      this.sendMessageDM(client, req);
    }
  }

  async sendPreviousMessage(
    client: Socket,
    user_id: string,
    channel_id: number,
  ) {
    const message = await this.channelsRepository.getAllMessage(channel_id);
    const block_users = await this.getBlockUsersAmongMember(
      client,
      user_id,
      channel_id,
    );

    if (message == undefined) {
      client.emit('DBError');
      return;
    }
    message.forEach((element) => {
      const user = block_users.find((user) => user == element.sender_id);
      if (user == undefined) {
        client.emit('channel/send', element.sender_id, element.content);
      }
    });
  }

  async sendMessageToChannel(client: Socket, req: any) {
    const is_mute = await this.cacheManager.get(`mute_${req.sender_id}`);
    if (is_mute != undefined && is_mute == req.channel_id) {
      client.emit(
        'channel/send',
        'server',
        `음소거 중! 메세지를 보낼 수 없습니다.`,
      );
      return;
    }

    if (this.isCommand(client, req) == true) return;

    const db_result = await this.channelsRepository.insertChannelMessage(
      req.channel_id,
      req.sender_id,
      req.message,
    );
    if (db_result == 500) {
      client.emit('DBError');
      return;
    }
    this.broadcastToChannel(client, req);
  }

  async sendMessageDM(client: Socket, req: any) {
    const db_result = await this.channelsRepository.insertDM(
      req.sender_id,
      req.receive_id,
      req.message,
    );
    if (db_result == 500) {
      client.emit('DBError');
      return;
    }
    this.broadcastToDM(client, req);
  }

  async broadcastToChannel(client: Socket, req: any) {
    const roomMembers = await this.channelsRepository.getRoomMembers(
      req.channel_id,
    );
    if (roomMembers == undefined) {
      client.emit('DBError');
      return;
    }
    roomMembers.forEach((element) =>
      this.sendToNonBlockedUser(element.user_id, req),
    );
  }

  async broadcastToDM(client: Socket, req: any) {
    const receiver = this.mainGateway.users.find(
      (user) => user.id == req.receive_id,
    );
    if (receiver == undefined) {
      this.logger.log(
        `[broadcastToDM] : ${req.receive_id}가 없음. 있을 수 없는 일!`,
      );
    }
    const is_block = await this.channelsRepository.isBlockedUser(
      receiver.id,
      req.sender_id,
    );
    if (is_block == 400 && receiver.status == UserStatus.online) {
      receiver.socket.emit(
        'DM/send',
        req.sender_id,
        req.receive_id,
        req.message,
      );
    }
    client.emit('DM/send', req.sender_id, req.receive_id, req.message);
  }

  async getBlockUsersAmongMember(
    client: Socket,
    user_id: string,
    channel_id: number,
  ) {
    const block_user: string[] = [];
    const roomMembers = await this.channelsRepository.getRoomMembers(
      channel_id,
    );
    if (roomMembers == undefined) {
      client.emit('DBError');
      return;
    }
    roomMembers.forEach(async (element) => {
      const db_result = await this.channelsRepository.isBlockedUser(
        user_id,
        element.user_id,
      );
      if (db_result == 200) {
        block_user.push(element.user_id);
      }
      if (db_result == 500) {
        client.emit('DBError');
        return;
      }
    });
    return block_user;
  }

  async sendToNonBlockedUser(receiver: string, req: any) {
    const member = this.mainGateway.users.find((user) => user.id == receiver);
    if (member == undefined) {
      this.logger.log(
        `[sendToNonBlockedUser] : ${receiver}가 없음. 있을 수 없는 일!`,
      );
      return;
    }
    const is_block = await this.channelsRepository.isBlockedUser(
      receiver,
      req.sender_id,
    );
    if (is_block == 400 && member.status == UserStatus.online) {
      member.socket.emit('channel/send', member.id, req.message);
    }
  }

  isCommand(client: Socket, req: any) {
    if (!(req.message[0] == '[' && -1 < req.message.search(']'))) {
      return false;
    }
    const keyword = req.message
      .slice(1, req.message.search(']'))
      .replace(/\s/g, '')
      .toLowerCase();
    const content = req.message
      .slice(req.message.search(']') + 1, req.message.length)
      .replace(/\s/g, '')
      .toLowerCase();

    switch (keyword) {
      case CHANNELCOMMAND.chpwd:
        this.changeChannelPassword(client, req, content);
        return true;
      case CHANNELCOMMAND.admin:
        this.insertChannelAdmin(client, req, content);
        return true;
      case CHANNELCOMMAND.kick:
        this.kickChannel(client, req, content);
        return true;
      case CHANNELCOMMAND.mute:
        this.muteChannel(client, req, content);
        return true;
      case CHANNELCOMMAND.ban:
        this.banChannel(client, req, content);
        return true;
      default:
        return false;
    }
  }

  async changeChannelPassword(client: Socket, req: any, password: string) {
    if (password.length != 4) {
      client.emit('channel/commandFailed', '4자리 비밀번호를 입력해주세요.');
      return;
    }
    const authority = await this.getAuthority(
      client,
      req.sender_id,
      req.channel_id,
    );
    if (authority == 400) return;

    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);
    const db_result = await this.channelsRepository.changeChannelPassword(
      req.channel_id,
      password,
    );
    if (db_result == 500) {
      client.emit('DBError');
    } else {
      client.emit(
        'channel/send',
        'server',
        `${password}로 비밀번호 변경 성공!`,
      );
    }
  }

  async insertChannelAdmin(client: Socket, req: any, admin_id: string) {
    const is_user_exist = await this.channelsRepository.isUserExist(admin_id);
    if (is_user_exist == 404) {
      client.emit('channel/commandFailed', '아이디가 존재하지 않습니다.');
      return;
    }

    const authority = await this.getAuthority(
      client,
      req.sender_id,
      req.channel_id,
    );
    if (authority == 400) return;

    const possible_authority = await this.checkHighAuthority(
      client,
      req.sender_id,
      admin_id,
      req.channel_id,
    );
    if (possible_authority == false) return;

    const db_result = await this.channelsRepository.changeChannelAuthority(
      admin_id,
      req.channel_id,
      CHANNELAUTHORITY.admin,
    );
    if (db_result == 500) {
      client.emit('DBError');
    } else {
      client.emit(
        'channel/send',
        'server',
        `${admin_id}를 관리자로 등록 완료!`,
      );
    }
  }

  async kickChannel(client: Socket, req: any, kick_id: string) {
    const is_user_exist = await this.channelsRepository.isUserExist(kick_id);
    if (is_user_exist == 404) {
      client.emit('channel/commandFailed', '아이디가 존재하지 않습니다.');
      return;
    }

    const authority = await this.getAuthority(
      client,
      req.sender_id,
      req.channel_id,
    );
    if (authority == 400) return;

    const possible_authority = await this.checkHighAuthority(
      client,
      req.sender_id,
      kick_id,
      req.channel_id,
    );
    if (possible_authority == false) return;

    try {
      await this.channelsRepository.exitChannel(kick_id, req.channel_id);
      client.emit('channel/send', 'server', `${kick_id}를 kick 완료!`);
    } catch {
      client.emit('DBError');
    }
  }

  async muteChannel(client: Socket, req: any, mute_id: string) {
    const is_user_exist = await this.channelsRepository.isUserExist(mute_id);
    if (is_user_exist == 404) {
      client.emit('channel/commandFailed', '아이디가 존재하지 않습니다.');
      return;
    }

    const authority = await this.getAuthority(
      client,
      req.sender_id,
      req.channel_id,
    );
    if (authority == 400) return;

    const possible_authority = await this.checkHighAuthority(
      client,
      req.sender_id,
      mute_id,
      req.channel_id,
    );
    if (possible_authority == false) return;

    await this.cacheManager.set(
      `mute_${mute_id}`,
      `${req.channel_id}`,
      MUTETIME,
    );
    client.emit('channel/send', 'server', `${mute_id}를 음소거 시킴!`);
  }

  async banChannel(client: Socket, req: any, ban_id: string) {
    const is_user_exist = await this.channelsRepository.isUserExist(ban_id);
    if (is_user_exist == 404) {
      client.emit('channel/commandFailed', '아이디가 존재하지 않습니다.');
      return;
    }

    const authority = await this.getAuthority(
      client,
      req.sender_id,
      req.channel_id,
    );
    if (authority == 400) return;

    const possible_authority = await this.checkHighAuthority(
      client,
      req.sender_id,
      ban_id,
      req.channel_id,
    );
    if (possible_authority == false) return;

    const db_result = await this.channelsRepository.patchBanStatus(
      ban_id,
      req.channel_id,
      true,
    );
    if (db_result == 500) {
      client.emit('DBError');
    } else {
      client.emit('channel/send', 'server', `${ban_id}를 ban 함!`);
    }
  }

  async getAuthority(client: Socket, id: string, channel_id: number) {
    const authority = await this.channelsRepository.getAuthority(
      id,
      channel_id,
    );
    if (authority == 400 || authority == 500) {
      client.emit('DBError');
      return 400;
    }
    if (authority == CHANNELAUTHORITY.guest) {
      client.emit('channel/commandFailed', '권한이 없습니다.');
      return 400;
    }
    return authority;
  }

  async checkHighAuthority(
    client: Socket,
    user1: string,
    user2: string,
    channel_id: number,
  ) {
    const user1_authority = await this.getAuthority(client, user1, channel_id);
    const user2_authority = await this.getAuthority(client, user2, channel_id);

    if (user1_authority == 400 || user2_authority == 400) return false;
    else if (user1_authority <= user2_authority) return true;
    else false;
  }
}
