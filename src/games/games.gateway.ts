import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MainGateway } from 'src/sockets/main.gateway';
import { UserInfo, USERSTATUS } from 'src/sockets/user.component';
import { GAMEOBJECT, GameRoomComponent } from './game.component';
import { GamesRepository } from './games.repository';
import getPosition from './schedules/getPosition.service';
import nextRound from './schedules/nextRound.service';
import updateBallPos from './schedules/updateBallPos.serviec';

@WebSocketGateway({ cors: true })
export class GameGateway {
  gameRooms: GameRoomComponent[] = [];
  private readonly logger: Logger = new Logger(GameGateway.name);
  constructor(
    public mainGateway: MainGateway,
    public gamesRepository: GamesRepository,
  ) {}

  @SubscribeMessage('game/invite')
  gameInvite(client: Socket, data: string) {
    const req = JSON.parse(data);
    this.enterInvitePlayerQueue(client);
    const partner = this.mainGateway.users.find(
      (user) => user.id == req.partenr_id,
    );
    if (partner == undefined) {
      this.logger.log(
        `[gameInvite] : ${req.partenr_id} 이런 일은 있을 수 없음.`,
      );
      return;
    }
    if (partner.status != USERSTATUS.online) {
      client.emit('game/failInvite', req.user_id);
      return;
    }
    partner.socket.emit('game/invite', req.user_id);
  }

  @SubscribeMessage('game/acceptedInvite')
  gameAcceptedInvite(client: Socket, data: string) {
    const req = JSON.parse(data);
    const player = this.mainGateway.users.find(
      (user) => user.id == req.partenr_id,
    );
    const partner = this.mainGateway.users.find(
      (user) => user.id == req.partenr_id,
    );
    if (player == undefined) {
      this.logger.log(
        `[gameInvite] : ${req.partenr_id} 이런 일은 있을 수 없음.`,
      );
      return;
    }
    if (player.status != USERSTATUS.online) {
      client.emit('game/failAcceptInvite', req.user_id);
      return;
    }
    if (partner == undefined) {
      this.logger.log(
        `[gameInvite] : ${req.partenr_id} 이런 일은 있을 수 없음.`,
      );
      return;
    }
    player.setStatusGaming();
    partner.setStatusGaming();
    this.startGame(player, partner);
  }

  @SubscribeMessage('game/watch')
  gameWatch(client: Socket, id: string) {
    const player = this.mainGateway.users.find((user) => user.id == id);
    if (player == undefined) {
      this.logger.log(`[gameCatch] : ${id} 이런 일은 있을 수 없음.`);
    }
    client.join(player.gameInfo.room_id);
    client.emit(
      'game/watchStart',
      player.gameInfo.p1_id,
      player.gameInfo.p2_id,
    );
    client.emit(
      'game/initCanvas',
      GAMEOBJECT.ball_radius,
      GAMEOBJECT.bar_width,
      GAMEOBJECT.bar_height,
    );
  }

  @SubscribeMessage('game/enter')
  enterGameQueue(client: Socket) {
    if (
      this.mainGateway.enterPlayer.find((element) => element == client) ==
      undefined
    ) {
      this.logger.log(`${client.id} enter!!!!!`);
      this.mainGateway.enterPlayer.push(client);
    }
    if (this.mainGateway.enterPlayer.length > 1) {
      const p1_p2 = this.getP1P2();
      this.startGame(p1_p2.p1, p1_p2.p2);
    }
  }

  @SubscribeMessage('game/move')
  movePlayer(client: Socket, data: string) {
    const player = this.mainGateway.users.find((user) => user.socket == client);
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
      (gameRoom.p1_y < GAMEOBJECT.canvas_height - GAMEOBJECT.bar_height ||
        value == -1) &&
      gameRoom.p1_id == player.id
    ) {
      gameRoom.p1_y += value * GAMEOBJECT.move_pixel;
    }
    if (
      (gameRoom.p2_y > 0 || value == 1) &&
      (gameRoom.p2_y < GAMEOBJECT.canvas_height - GAMEOBJECT.bar_height ||
        value == -1) &&
      gameRoom.p2_id == player.id
    ) {
      gameRoom.p2_y += value * GAMEOBJECT.move_pixel;
    }
  }

  @SubscribeMessage('game/giveUp')
  giveUpGame(client: Socket) {
    const player = this.mainGateway.users.find((user) => user.socket == client);
    const gameRoom = this.gameRooms.find(
      (gameRoom) => gameRoom.room_id == player.gameInfo.room_id,
    );
    setTimeout(nextRound, 0, gameRoom, this);
  }

  getP1P2() {
    let room_id: string;
    const p1 = this.mainGateway.users.find(
      (user) => user.socket == this.mainGateway.enterPlayer[0],
    );
    const p2 = this.mainGateway.users.find(
      (user) => user.socket == this.mainGateway.enterPlayer[1],
    );
    if (p1 == undefined) {
      this.logger.log(
        `[startGame] : p1(${this.mainGateway.enterPlayer[0].id}) is undifiend`,
      );
      this.mainGateway.enterPlayer.splice(0, 1);
      return;
    }
    if (p2 == undefined) {
      this.logger.log(
        `[startGame] : p2(${this.mainGateway.enterPlayer[1].id}) is undifiend`,
      );
      this.mainGateway.enterPlayer.splice(1, 2);
      return;
    }

    room_id = p1.id + '_' + p2.id;
    this.mainGateway.enterPlayer.splice(0, 2);
    p1.gameInfo.init(p1.id, p2.id, room_id);
    p2.gameInfo.init(p1.id, p2.id, room_id);
    p1.socket.join(room_id);
    p2.socket.join(room_id);
    p1.setStatusGaming();
    p2.setStatusGaming();
    return { p1, p2 };
  }

  startGame(p1: UserInfo, p2: UserInfo) {
    const room_id = p1.id + '_' + p2.id;
    const gameRoom = new GameRoomComponent();
    gameRoom.room_id = room_id;
    gameRoom.p1_id = p1.id;
    gameRoom.p2_id = p2.id;
    this.gameRooms.push(gameRoom);
    this.mainGateway.server.to(room_id).emit('game/start', p1.id, p2.id);
    this.mainGateway.server
      .to(room_id)
      .emit(
        'game/initCanvas',
        GAMEOBJECT.ball_radius,
        GAMEOBJECT.bar_width,
        GAMEOBJECT.bar_height,
      );
    gameRoom.interval_ball = setInterval(
      updateBallPos,
      GAMEOBJECT.ballSpeed,
      gameRoom,
      this,
    );
    gameRoom.interval_move = setInterval(
      getPosition,
      GAMEOBJECT.drawUpdateTime,
      gameRoom,
      this.mainGateway.server,
    );
  }

  enterInvitePlayerQueue(client: Socket) {
    if (
      this.mainGateway.invitePlayer.find((element) => element == client) ==
      undefined
    ) {
      this.logger.log(`${client.id} invite game queue enter!!!!!`);
      this.mainGateway.invitePlayer.push(client);
    }
  }
}
