import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ScheduleService } from './schedule.service';
import { UserInfo, GameRoomComponent, GameObject } from './user.component';

@WebSocketGateway({ cors: true })
export class MainGateway {
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
      this.gameRooms.push(gameRoom);
      this.server
        .to(room_id)
        .emit(
          'startGame',
          p1.id,
          p2.id,
          GameObject.ball_radius,
          GameObject.bar_width,
          GameObject.bar_height,
        );
      setInterval(ScheduleService.updateBallPos, 100, gameRoom);
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
      gameRoom.ball_x,
      gameRoom.ball_y,
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

    let value = 1;
    if ('up' == data) {
      value = -1;
    } else if ('down' == data) {
      value = 1;
    }
    if (
      (gameRoom.p1_y > 0 || value == 1) &&
      (gameRoom.p1_y < GameObject.canvas_height + GameObject.bar_height ||
        value == -1) &&
      gameRoom.p1_id == player.id
    ) {
      gameRoom.p1_y += value * GameObject.move_pixel;
      this.logger.log(gameRoom.p1_y);
    }
    if (
      (gameRoom.p2_y > 0 || value == 1) &&
      (gameRoom.p2_y < GameObject.canvas_height + GameObject.bar_height ||
        value == -1) &&
      gameRoom.p2_id == player.id
    ) {
      gameRoom.p2_y += value * GameObject.move_pixel;
      this.logger.log(gameRoom.p2_y);
    }
    this.getPosition(client);
  }
}
