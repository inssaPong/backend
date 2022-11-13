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

  @SubscribeMessage('channel/enter')
  async enterChannel(client: Socket, data: string) {
    const object = JSON.parse(data);
    const status_code = await this.channelsRepository.checkPossibleChannel(
      object.user_id,
      object.channel_id,
    );
    if (status_code == 400) {
      client.emit('channel/enterFail');
      return;
    }
    if (status_code == 500) {
      client.emit('channel/DBFail');
      return;
    }
    this.sendBeforeMessage(client, object.user_id, object.channel_id);
  }

  @SubscribeMessage('channel/send')
  async sendMessage(client: Socket, data: string) {
    const object = JSON.parse(data);
    const db_result = await this.channelsRepository.insertMessage(
      object.channel_id,
      object.sender_id,
      object.message,
    );
    if (db_result == 500) {
      this.logger.log('[sendMessage] db error.');
      client.emit('channel/sendFail');
      return;
    }
    this.sendMessage_sendMember(client, object);
  }

  @SubscribeMessage('DM/send')
  async sendDM(client: Socket, data: string) {
    const object = JSON.parse(data);
    const db_result = await this.channelsRepository.insertDM(
      object.sender_id,
      object.receive_id,
      object.message,
    );
    if (db_result == 500) {
      this.logger.log('[sendDM]DB error.');
      client.emit('channel/sendFail');
      return;
    }
    this.sendDM_sendReceiveUser(object);
    this.sendDM_sendSenderUser(object);
  }

  async sendBeforeMessage(client: Socket, user_id: string, channel_id: string) {
    const message = await this.channelsRepository.selectAllMessage(channel_id);
    const block_users = await this.getBlockUsers(client, user_id, channel_id);

    if (message == undefined) {
      return;
    }
    message.forEach((element) => {
      const user = block_users.find((user) => user == element.sender_id);
      if (user == undefined) {
        client.emit('channel/send', element.sender_id, element.content);
      }
    });
  }

  async sendMessage_sendMember(client: Socket, object: any) {
    const roomMembers = await this.channelsRepository.selectRoomMember(
      object.channel_id,
    );
    if (roomMembers == undefined) {
      this.logger.log('[sendMessage] db error.');
      client.emit('channel/sendFail');
      return;
    }

    roomMembers.forEach((element) =>
      this.sendMessage_checkBlockUserAndSend(element, object),
    );
  }

  sendDM_sendReceiveUser(object: any) {
    const receive_user = this.mainGateway.users.find(
      (user) => user.id == object.receive_id,
    );
    if (receive_user != undefined) {
      this.logger.log(
        `[sendDM] ${object.receive_id} : 여기 들어오면 안돼!! 이젠 절대 있을 수 없는 일임.`,
      );
      this.mainGateway.initUsers();
    }
    if (receive_user.status == UserStatus.online) {
      object.receive_id.socket.emit(
        'DM/send',
        object.sender_id,
        object.receive_id,
        object.message,
      );
    }
  }

  sendDM_sendSenderUser(object: any) {
    const receive_user = this.mainGateway.users.find(
      (user) => user.id == object.sender_id,
    );
    if (receive_user != undefined) {
      this.logger.log(
        `[sendDM] ${object.receive_id} : 여기 들어오면 안돼!! 이젠 절대 있을 수 없는 일임.`,
      );
      this.mainGateway.initUsers();
    }
    if (receive_user.status == UserStatus.online) {
      object.receive_id.socket.emit(
        'DM/send',
        object.sender_id,
        object.receive_id,
        object.message,
      );
    }
  }

  async getBlockUsers(client: Socket, user_id: string, channel_id: string) {
    let block_user: string[] = [];
    const roomMembers = await this.channelsRepository.selectRoomMember(
      channel_id,
    );
    if (roomMembers == undefined) {
      this.logger.log('[getBlockUsers] db error.');
      client.emit('channel/sendFail');
      return;
    }
    roomMembers.forEach(async (element) => {
      const db_result = await this.channelsRepository.selectBlockUser(
        user_id,
        element.id,
      );
      if (db_result == true) {
        block_user.push(element.id);
      }
    });
    return block_user;
  }

  async sendMessage_checkBlockUserAndSend(element: any, object: any) {
    const member = this.mainGateway.users.find((user) => user.id == element.id);
    const is_block = await this.channelsRepository.selectBlockUser(
      element.id,
      object.sender_id,
    );
    if (
      member != undefined &&
      is_block == false &&
      member.status == UserStatus.online
    ) {
      member.socket.emit('channel/send', member.id, object.message);
    }
  }
}
