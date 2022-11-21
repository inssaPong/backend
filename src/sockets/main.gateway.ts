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
  invitePlayer: Socket[] = [];
  private readonly logger: Logger = new Logger(MainGateway.name);
  constructor(private mainSocketRepository: MainSocketRepository) {}

  async afterInit() {
    await this.initUsers();
  }

  handleConnection(client: Socket) {
    this.setOnline(client);
  }

  handleDisconnect(client: Socket) {
    this.userDisconnect(client);
  }

  setOnline(client: Socket) {
    const user_id = client.handshake.query.user_id;
    const user = this.users.find((element) => element.id == user_id);
    if (user == undefined) {
      this.logger.log(
        `[connect] ${user_id} : 여기 들어오면 안돼!! 이젠 절대 있을 수 없는 일임.`,
      );
      this.initUsers();
      return;
    }
    this.logger.log(`[setOnline] : ${user_id}`);
    user.socket = client;
    user.setStatusOnline();
    this.server.emit(`getUserStatus_${user_id}`, user.status);
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
    client.emit(`getUserStatus_${id}`, user.status);
  }

  newUser(id: string) {
    const user = new UserInfo();
    user.id = id;
    this.users.push(user);
  }

  userDisconnect(client: Socket) {
    const user = this.users.find((element) => element.socket == client);
    if (user == undefined) {
      this.logger.log(
        `[disconnect] 여기 들어오면 안돼!! 그치만 발생할 수도 있는 일임.`,
      );
      this.initUsers();
      return;
    }
    user.setStatusOffline();
    this.server.emit(`getUserStatus_${user.id}`, user.status);
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
