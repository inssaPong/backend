import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MainGateway } from 'src/sockets/main.gateway';
import { UserInfo, USER_STATUS } from 'src/sockets/user.component';
import { GAME_OBJECT, GameRoomComponent } from './game.component';
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
    public readonly gamesRepository: GamesRepository,
  ) {}

  @SubscribeMessage('game/invite')
  gameInvite(client: Socket, data: string) {
    const req = JSON.parse(data);
    this.enterInvitePlayerQueue(client);
    const partner = this.mainGateway.users.find(
      (user) => user.id == req.partner_id,
    );
    if (partner == undefined) {
      this.logger.log(
        `[gameInvite] : ${req.partner_id} 이런 일은 있을 수 없음.`,
      );
      return;
    }
    if (partner.status != USER_STATUS.ONLINE) {
      client.emit('game/failInvite', req.user_id);
      return;
    }
    partner.socket.emit('game/invite', req.user_id);
    client.emit(`game/successInvited/${req.partner_id}`);
  }

  @SubscribeMessage('game/acceptedInvite')
  gameAcceptedInvite(client: Socket, data: string) {
    const req = JSON.parse(data);
    this.checkInvitePlayers(req, client);
  }

  @SubscribeMessage('game/watch')
  gameWatch(client: Socket, id: string) {
    const player = this.mainGateway.users.find((user) => user.id == id);
    if (player == undefined) {
      this.logger.log(`[gameCatch] : ${id} 이런 일은 있을 수 없음.`);
    }
    client.join(player.gameInfo.room_id);
    client.emit('game/getRoomId', player.gameInfo.room_id);
    client.emit(
      'game/watchStart',
      player.gameInfo.p1_id,
      player.gameInfo.p2_id,
    );
    client.emit(
      'game/initCanvas',
      GAME_OBJECT.BALL_RADIUS,
      GAME_OBJECT.BAR_WIDTH,
      GAME_OBJECT.BAR_HEIGHT,
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
      const p1_p2 = this.getP1P2();
      if (p1_p2 == undefined) {
        return;
      }
      this.startGame(p1_p2.p1, p1_p2.p2);
    }
  }

  @SubscribeMessage('game/move')
  movePlayer(client: Socket, data: string) {
    const player = this.mainGateway.users.find((user) => user.socket == client);
    if (player == undefined) {
      this.logger.log(`[movePlayer] : ${client.id} 이런 일은 있을 수 없음.`);
    }
    const gameRoom = this.gameRooms.find(
      (room) => room.room_id == player.gameInfo.room_id,
    );
    if (gameRoom == undefined) {
      this.logger.log(`[movePlayer] : ${player.gameInfo.room_id} error.`);
    }

    let value = 1;
    if ('up' == data) {
      value = -1;
    } else if ('down' == data) {
      value = 1;
    }
    if (
      (gameRoom.p1_y > 0 || value == 1) &&
      (gameRoom.p1_y < GAME_OBJECT.CANVAS_HEIGHT - GAME_OBJECT.BAR_HEIGHT ||
        value == -1) &&
      gameRoom.p1_id == player.id
    ) {
      gameRoom.p1_y += value * GAME_OBJECT.MOVE_PIXEL;
    }
    if (
      (gameRoom.p2_y > 0 || value == 1) &&
      (gameRoom.p2_y < GAME_OBJECT.CANVAS_HEIGHT - GAME_OBJECT.BAR_HEIGHT ||
        value == -1) &&
      gameRoom.p2_id == player.id
    ) {
      gameRoom.p2_y += value * GAME_OBJECT.MOVE_PIXEL;
    }
  }

  @SubscribeMessage('game/giveUp')
  giveUpGame(client: Socket) {
    const player = this.mainGateway.users.find((user) => user.socket == client);
    if (player == undefined) {
      this.logger.log(`[giveUpGame] : ${client.id} 이런 일은 있을 수 없음.`);
    }
    const gameRoom = this.gameRooms.find(
      (gameRoom) => gameRoom.room_id == player.gameInfo.room_id,
    );
    if (gameRoom == undefined) {
      this.logger.log(`[giveUpGame] : ${player.gameInfo.room_id} error.`);
    }
    if (gameRoom.p1_id == player.id)
      gameRoom.p2_score = GAME_OBJECT.FINAL_SCORE;
    else gameRoom.p1_score = GAME_OBJECT.FINAL_SCORE;
    this.mainGateway.server.to(gameRoom.room_id).emit('game/giveUp', player.id);
    setTimeout(nextRound, 0, gameRoom, this);
  }

  @SubscribeMessage('game/exit')
  exit(client: Socket, room_id: string) {
    this.mainGateway.enterPlayer = this.mainGateway.enterPlayer.filter(
      (element) => element != client,
    );
    this.mainGateway.invitePlayer = this.mainGateway.invitePlayer.filter(
      (element) => element != client,
    );

    const player = this.mainGateway.users.find((user) => user.socket == client);
    if (player == undefined) {
      this.logger.log(`[exit] : ${client.id} 이런 일은 있을 수 없음.`);
    }
    const gameRoom = this.gameRooms.find(
      (gameRoom) => gameRoom.room_id == player.gameInfo.room_id,
    );
    if (gameRoom == undefined) {
      client.leave(room_id);
      this.logger.error(room_id);
      return;
    }
    this.giveUpGame(client);
  }

  getP1P2() {
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
    this.mainGateway.enterPlayer.splice(0, 2);
    return { p1, p2 };
  }

  startGame(p1: UserInfo, p2: UserInfo) {
    const room_id = p1.id + '_' + p2.id;
    const gameRoom = new GameRoomComponent();
    gameRoom.room_id = room_id;
    gameRoom.p1_id = p1.id;
    gameRoom.p2_id = p2.id;
    p1.socket.join(room_id);
    p2.socket.join(room_id);
    p1.gameInfo.init(p1.id, p2.id, room_id);
    p2.gameInfo.init(p1.id, p2.id, room_id);
    p1.setStatusGaming();
    p2.setStatusGaming();
    this.mainGateway.server.emit(`getUserStatus_${p1.id}`, p1.status);
    this.mainGateway.server.emit(`getUserStatus_${p2.id}`, p2.status);
    this.gameRooms.push(gameRoom);
    this.mainGateway.server.to(room_id).emit('game/getRoomId', gameRoom);
    this.mainGateway.server.to(room_id).emit('game/start', p1.id, p2.id);
    this.mainGateway.server
      .to(room_id)
      .emit(
        'game/initCanvas',
        GAME_OBJECT.BALL_RADIUS,
        GAME_OBJECT.BAR_WIDTH,
        GAME_OBJECT.BAR_HEIGHT,
      );
    gameRoom.interval_ball = setInterval(
      updateBallPos,
      GAME_OBJECT.BALL_SPEED,
      gameRoom,
      this,
    );
    gameRoom.interval_move = setInterval(
      getPosition,
      GAME_OBJECT.DRAW_UPDATE_TIME,
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

  checkInvitePlayers(req: any, client: Socket) {
    const player = this.mainGateway.users.find(
      (user) => user.id == req.user_id,
    );
    const partner = this.mainGateway.users.find(
      (user) => user.id == req.partner_id,
    );
    if (player == undefined) {
      this.logger.log(
        `[checkInvitePlayers] : ${req.user_id} 이런 일은 있을 수 없음.`,
      );
      return;
    }
    if (player.status != USER_STATUS.ONLINE) {
      client.emit('game/failAcceptInvite', req.user_id);
      return;
    }
    if (partner == undefined) {
      this.logger.log(
        `[checkInvitePlayers] : ${req.partner_id} 이런 일은 있을 수 없음.`,
      );
      return;
    }
    if (partner.status != USER_STATUS.ONLINE) {
      client.emit('game/failAcceptInvite', req.partner_id);
      return;
    }
    const p1 = this.mainGateway.invitePlayer.find(
      (user) => user.id == player.socket.id,
    );
    const p2 = this.mainGateway.invitePlayer.find(
      (user) => user.id == partner.socket.id,
    );
    if (p1 == undefined && p2 == undefined) {
      client.emit('game/notInvited', req.partner_id);
      return;
    }
    if (p1 != undefined) {
      return;
    }
    this.startGame(player, partner);
  }
}
