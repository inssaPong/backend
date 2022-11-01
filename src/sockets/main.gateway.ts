import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameObject, GameRoomComponent } from 'src/games/game.component';
import nextRound from 'src/games/schedules/nextRound.service';
import { UserInfo } from './user.component';

@WebSocketGateway({ cors: true })
export class MainGateway {
  @WebSocketServer()
  server: Server;
  users: UserInfo[] = [];
  logger: Logger = new Logger('MainGameway');
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
