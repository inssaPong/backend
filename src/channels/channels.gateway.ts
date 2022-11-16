import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MainGateway } from 'src/sockets/main.gateway';
import { UserStatus } from 'src/sockets/user.component';
import { ChannelsRepository } from './channels.repository';

@WebSocketGateway({ cors: true })
export class ChannelGateway {
  private readonly logger: Logger = new Logger(ChannelGateway.name);
  constructor(
    private mainGateway: MainGateway,
    private channelsRepository: ChannelsRepository,
  ) {}

  // @SubscribeMessage('channel/enter')
  // async enterChannel(client: Socket, data: string) {
  //   const req = JSON.parse(data);
  //   const status_code = await this.channelsRepository.checkPossibleChannel(
  //     req.user_id,
  //     req.channel_id,
  //   );
  //   if (status_code == 400) {
  //     client.emit('channel/enterFail');
  //     return;
  //   }
  //   if (status_code == 500) {
  //     client.emit('channel/DBFail');
  //     return;
  //   }
  //   this.sendBeforeMessage(client, req.user_id, req.channel_id);
  // }

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
    roomMembers.forEach((element) => this.sendToNonBlockedUser(element, req));
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
        element.id,
      );
      if (db_result == 200) {
        block_user.push(element.id);
      }
      if (db_result == 500) {
        client.emit('DBError');
        return;
      }
    });
    return block_user;
  }

  async sendToNonBlockedUser(receiver: any, req: any) {
    const member = this.mainGateway.users.find(
      (user) => user.id == receiver.id,
    );
    if (member == undefined) {
      this.logger.log(
        `[sendToNonBlockedUser] : ${receiver.id}가 없음. 있을 수 없는 일!`,
      );
    }
    const is_block = await this.channelsRepository.isBlockedUser(
      receiver.id,
      req.sender_id,
    );
    if (is_block == 400 && member.status == UserStatus.online) {
      member.socket.emit('channel/send', member.id, req.message);
    }
  }
}
