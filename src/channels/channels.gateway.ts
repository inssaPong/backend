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
    const message = `${object.user_id}가 ${object.channel_id}에 참가함!}`;
    data = `{"user_id" : ${object.user_id},
            "channel_id" : "",
            "message" : ${message},
    }`;
    const status_code = await this.channelsRepository.insertChannel(
      object.user_id,
      object.channel_id,
    );
    if (status_code == 500) {
      client.emit('channel/enterFail');
      return;
    }
    this.sendMessage(client, data);
  }

  @SubscribeMessage('channel/send')
  async sendMessage(client: Socket, data: string) {
    const object = JSON.parse(data);
    const RoomMember = await this.channelsRepository.selectRoomMember(
      object.channel_id,
    );
    if (RoomMember.length == 0) {
      return;
      // client.emit('channel/sendFail');
    }
    RoomMember.forEach((element) => {
      const member = this.mainGateway.users.find(
        (user) => user.id == element.id,
      );
      if (member != undefined && member.status == UserStatus.online) {
        member.socket.emit('channel/send', member.id, object.message);
      }
    });
  }
}
