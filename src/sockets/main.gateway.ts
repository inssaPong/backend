import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserInfo } from './user.component';

@WebSocketGateway({ cors: true })
export class MainGateway {
  @WebSocketServer()
  server: Server;
  users: UserInfo[] = [];
  enterPlayer: Socket[] = [];
  logger: Logger = new Logger('MainGameway');

  afterInit() {
    this.newUser('seungoh');
    this.newUser('sehyan');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.userDisconnect(client);
    this.users = this.users.filter((user) => user.socket != client);
    this.enterPlayer = this.enterPlayer.filter((element) => element != client);
    this.logger.log(`Client Disconnected : ${client.id}`);
  }

  @SubscribeMessage('getUserId')
  getUserId(client: Socket, id: string) {
    let user = this.users.find((user) => user.id == id);
    if (user == undefined) {
      this.logger.log(
        `[connect] ${id} : 여기 들어오면 안돼!! 뭔가 이상한거임.`,
      );
      return;
    }
    user.socket = client;
    user.setStatusOnline();
  }

  @SubscribeMessage('getUserId')
  getUserStatus(client: Socket, id: string) {
    const user = this.users.find((element) => element.id == id);
    if (user == undefined) {
      this.logger.log(
        `[getUserId] ${id} : 여기 들어오면 안돼!! 뭔가 이상한거임.`,
      );
      return;
    }
    client.emit('getUserId', user.status);
  }

  newUser(id: string) {
    const user = new UserInfo();
    user.id = id;
    this.users.push(user);
  }

  userDisconnect(client: Socket) {
    const player = this.users.find((user) => user.socket == client);
    if (player == undefined) {
      this.logger.log(`[disconnect] 여기 들어오면 안돼!! 뭔가 이상한거임.`);
      return;
    }
    player.setStatusOffline();
  }
}
