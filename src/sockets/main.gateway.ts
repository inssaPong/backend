import { Logger } from '@nestjs/common';
import { ContextIdFactory } from '@nestjs/core';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SignKeyObjectInput } from 'crypto';
import { Server, Socket } from 'socket.io';
import { UserInfo, GameRoomComponent } from './user.component';

@WebSocketGateway({ cors: true })
export class MainGateway {
  // constructor(private readonly userInfo: UserInfo) {}

  @WebSocketServer()
  server: Server;
  users: UserInfo[] = [];
  private logger: Logger = new Logger('AppGateway');
  enterPlayer: Socket[] = [];
  gameRooms: GameRoomComponent[] = [];

  afterInit() {}

  handleConnection(client: Socket, ...args: any[]) {
    const user = new UserInfo();
    user.socket = client;
    this.users.push(user);
    this.logger.log(`Client Connected : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.users = this.users.filter((user) => user.socket != client);
    this.enterPlayer = this.enterPlayer.filter((element) => element != client);
    this.logger.log(`Client Disconnected : ${client.id}`);
  }

  @SubscribeMessage('getUserId')
  getUserId(client: Socket, id: string) {
    const user = this.users.find((element) => element.socket == client);
    user.id = id;
  }

  @SubscribeMessage('enterGameQueue')
  enterGameQueue(client: Socket) {
    if (this.enterPlayer.find((element) => element == client) == undefined) {
      this.enterPlayer.push(client);
    }
    if (this.enterPlayer.length > 1) {
      this.logger.log(`2명 이상!!!!!! 룸 생성!!!!!!`);
      let room_id: string;
      const p1 = this.users.find((user) => user.socket == this.enterPlayer[0]);
      const p2 = this.users.find((user) => user.socket == this.enterPlayer[1]);

      room_id = p1.id + '_' + p2.id;
      this.enterPlayer.splice(0, 2);
      this.logger.log(`room id : ${room_id}`);
      p1.gameInfo.init(p1.id, p2.id, room_id);
      p2.gameInfo.init(p1.id, p2.id, room_id);
      p1.socket.join(room_id);
      p2.socket.join(room_id);

      const gameRoom = new GameRoomComponent();
      gameRoom.room_id = room_id;
      gameRoom.p1_id = p1.id;
      gameRoom.p2_id = p2.id;
      gameRoom.init();
      this.gameRooms.push(gameRoom);
      this.server.to(room_id).emit('startGame', p1.id, p2.id);
    }
  }

  @SubscribeMessage('getPosition')
  getPosition(client: Socket) {
    const player = this.users.find((user) => user.socket == client);
    const gameRoom = this.gameRooms.find(
      (room) => room.room_id == player.gameInfo.room_id,
    );
    client.emit(
      'draw',
      gameRoom.p1_x,
      gameRoom.p1_y,
      gameRoom.p2_x,
      gameRoom.p2_y,
    );
  }

  @SubscribeMessage('move')
  handleMessage(client: Socket, data: string) {
    const player = this.users.find((user) => user.socket == client);
    const gameRoom = this.gameRooms.find(
      (room) => room.room_id == player.gameInfo.room_id,
    );

    let value;
    if ('up' == data) {
      value = -1;
    } else {
      value = 1;
    }
    if (
      (gameRoom.p1_y > 0 || value == 1) &&
      (gameRoom.p1_y < 120 || value == -1) &&
      gameRoom.p1_id == player.id
    ) {
      gameRoom.p1_y += value;
      this.logger.log(gameRoom.p1_y);
    }
    if (
      (gameRoom.p2_y > 0 || value == 1) &&
      (gameRoom.p2_y < 120 || value == -1) &&
      gameRoom.p2_id == player.id
    ) {
      gameRoom.p2_y += value;
      this.logger.log(gameRoom.p2_y);
    }
    this.getPosition(client);
  }
}
