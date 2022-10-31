import { Logger, UseInterceptors } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { getPosition, nextRound, updateBallPos } from './schedule.service';
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
    this.playDisconnect(client);
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
      gameRoom.interval_ball = setInterval(
        updateBallPos,
        GameObject.ballSpeed,
        gameRoom,
        this,
      );
      gameRoom.interval_move = setInterval(
        getPosition,
        GameObject.drawUpdateTime,
        gameRoom,
        this.server,
      );
    }
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
      (gameRoom.p1_y < GameObject.canvas_height - GameObject.bar_height ||
        value == -1) &&
      gameRoom.p1_id == player.id
    ) {
      gameRoom.p1_y += value * GameObject.move_pixel;
    }
    if (
      (gameRoom.p2_y > 0 || value == 1) &&
      (gameRoom.p2_y < GameObject.canvas_height - GameObject.bar_height ||
        value == -1) &&
      gameRoom.p2_id == player.id
    ) {
      gameRoom.p2_y += value * GameObject.move_pixel;
    }
  }

  gameOver(gameRoom: GameRoomComponent) {
    const p1_id: string = gameRoom.p1_id;
    const p2_id: string = gameRoom.p2_id;
    this.gameRooms = this.gameRooms.filter(
      (element) => element.room_id != gameRoom.room_id,
    );
    const p1 = this.users.find((user) => user.id == p1_id);
    if (p1 != undefined) {
      p1.gameInfo.reset();
    }
    const p2 = this.users.find((user) => user.id == p2_id);
    if (p2 != undefined) {
      p2.gameInfo.reset();
    }
  }

  playDisconnect(client: Socket) {
    const player = this.users.find((user) => user.socket == client);
    if (player.gameInfo.room_id == '') return;
    const gameRoom = this.gameRooms.find(
      (room) => room.room_id == player.gameInfo.room_id,
    );
    if (gameRoom.p1_id == player.id) {
      gameRoom.p2_score = GameObject.finalScore;
    } else {
      gameRoom.p1_score = GameObject.finalScore;
    }
    setTimeout(nextRound, 0, gameRoom, this);
  }
}
