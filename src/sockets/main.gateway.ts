import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MainSocketRepository } from './main.repository';
import { UserInfo } from './user.component';

@WebSocketGateway({ cors: true })
export class MainGateway {
  @WebSocketServer()
  server: Server;
  users: UserInfo[] = [];
  enterPlayer: Socket[] = [];
  logger: Logger = new Logger('MainGameway');
  constructor(private mainSocketRepository: MainSocketRepository) {}

  async afterInit() {
    await this.initUsers();
  }

  handleConnection(client: Socket) {
    this.setOnline(client);
    this.logger.log(`Client Connected : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.userDisconnect(client);
    this.enterPlayer = this.enterPlayer.filter((element) => element != client);
    this.logger.log(`Client Disconnected : ${client.id}`);
  }

  setOnline(client: Socket) {
    const user_id = client.handshake.query.user_id;
    const user = this.users.find((user) => user.id == user_id);
    if (user == undefined) {
      this.logger.log(
        `[connect] ${user_id} : 여기 들어오면 안돼!! 이젠 절대 있을 수 없는 일임.`,
      );
      this.initUsers();
      return;
    }
    user.socket = client;
    user.setStatusOnline();
  }

  @SubscribeMessage('getUserStatus')
  getUserStatus(client: Socket, id: string) {
    const user = this.users.find((user) => user.id == id);
    if (user == undefined) {
      this.logger.log(
        `[getUserStatus] ${id} : 여기 들어오면 안돼!! 이젠 절대 있을 수 없는 일임.`,
      );
      this.initUsers();
      return;
    }
    client.emit('getUserStatus', user.status);
  }

  newUser(id: string) {
    const user = new UserInfo();
    user.id = id;
    this.users.push(user);
  }

  userDisconnect(client: Socket) {
    const player = this.users.find((user) => user.socket == client);
    if (player == undefined) {
      this.logger.log(
        `[disconnect] 여기 들어오면 안돼!! 그치만 발생할 수도 있는 일임.`,
      );
      this.initUsers();
      return;
    }
    player.setStatusOffline();
  }

  async initUsers() {
    const users = await this.mainSocketRepository.getUsers();
    if (users == undefined) {
      this.logger.log('[mainSocketDB]getUsers : error');
      return;
    }
    users.forEach((element) => {
      this.newUser(element.id);
    });
  }

  printAllUser() {
    this.users.forEach((element) => {
      this.logger.log(element.id);
    });
  }
}
