import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MainGateway } from 'src/sockets/main.gateway';
import { GameObject, GameRoomComponent } from './game.component';
import getPosition from './schedules/getPosition.service';
import updateBallPos from './schedules/updateBallPos.serviec';

@WebSocketGateway({ cors: true })
export class GameGateway {
  constructor(public mainGateway: MainGateway) {}
  logger: Logger = new Logger('GameGameway');

  @SubscribeMessage('game/watch')
  gameCatch(client: Socket, id: string) {
    const player = this.mainGateway.users.find((user) => user.id == id);
    client.join(player.gameInfo.room_id);
    client.emit(
      'game/watchStart',
      player.gameInfo.p1_id,
      player.gameInfo.p2_id,
      GameObject.ball_radius,
      GameObject.bar_width,
      GameObject.bar_height,
    );
  }

  @SubscribeMessage('game/enter')
  enterGameQueue(client: Socket) {
    if (
      this.mainGateway.enterPlayer.find((element) => element == client) ==
      undefined
    ) {
      this.mainGateway.enterPlayer.push(client);
    }
    if (this.mainGateway.enterPlayer.length > 1) {
      let room_id: string;
      const p1 = this.mainGateway.users.find(
        (user) => user.socket == this.mainGateway.enterPlayer[0],
      );
      const p2 = this.mainGateway.users.find(
        (user) => user.socket == this.mainGateway.enterPlayer[1],
      );

      room_id = p1.id + '_' + p2.id;
      this.mainGateway.enterPlayer.splice(0, 2);
      p1.gameInfo.init(p1.id, p2.id, room_id);
      p2.gameInfo.init(p1.id, p2.id, room_id);
      p1.socket.join(room_id);
      p2.socket.join(room_id);

      const gameRoom = new GameRoomComponent();
      gameRoom.room_id = room_id;
      gameRoom.p1_id = p1.id;
      gameRoom.p2_id = p2.id;
      this.mainGateway.gameRooms.push(gameRoom);
      this.mainGateway.server
        .to(room_id)
        .emit(
          'game/start',
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
        this.mainGateway,
      );
      gameRoom.interval_move = setInterval(
        getPosition,
        GameObject.drawUpdateTime,
        gameRoom,
        this.mainGateway.server,
      );
    }
  }

  @SubscribeMessage('game/move')
  movePlayer(client: Socket, data: string) {
    const player = this.mainGateway.users.find((user) => user.socket == client);
    const gameRoom = this.mainGateway.gameRooms.find(
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

  @SubscribeMessage('game/giveUp')
  giveUpGame(client: Socket) {
    this.mainGateway.playDisconnect(client);
  }
}
