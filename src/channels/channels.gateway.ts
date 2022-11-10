import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MainGateway } from 'src/sockets/main.gateway';
import { UserStatus } from 'src/sockets/user.component';
import { ChannelsRepository } from './channels.repository';

@WebSocketGateway({ cors: true })
export class ChannelGateway {
  constructor(
    private mainGateway: MainGateway,
    private channelsRepository: ChannelsRepository,
  ) {}
  logger: Logger = new Logger('ChannelGateway');

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
    // 채널 사람이 맞으면 이전 메세지 전부 보내기
    // 차단된 사람은 제외
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

  async sendMessage_sendMember(client: Socket, object: any) {
    const roomMember = await this.channelsRepository.selectRoomMember(
      object.channel_id,
    );
    if (roomMember == undefined) {
      this.logger.log('[sendMessage] db error.');
      client.emit('channel/sendFail');
      return;
    }
    // 차단한 사람 제외하고 보내기
    roomMember.forEach((element) => {
      const member = this.mainGateway.users.find(
        (user) => user.id == element.id,
      );
      if (member != undefined && member.status == UserStatus.online) {
        member.socket.emit('channel/send', member.id, object.message);
      }
    });
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

  checkBlock() {}
}
