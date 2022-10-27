import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { GameComponent, Player } from './game.component';

// @WebSocketGateway({ namespace: 'game' }, { cors: true })
@WebSocketGateway({ namespace: 'game', cors: true })
export class GameGateway {
  @WebSocketServer()
  server: Server;
  players: Player[] = [];
  private logger: Logger = new Logger('AppGateway');
  // pp: GameComponent[];

  afterInit() {}

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.players = this.players.filter((player) => player.socket !== client);
    this.logger.log(`Client Disconnected : ${client.id}`);
  }

  @SubscribeMessage('playingGame')
  playingGame(client: Socket, id: string) {
    if (this.players.find((element) => element.socket == client) == undefined) {
      const new_player = new Player();
      new_player.socket = client;
      new_player.id = id;
      this.logger.log(`${new_player.id}`);
      this.players.push(new_player);
    }
    if (this.players.length > 1) {
      this.logger.log(`2명 이상!!!!!! 룸 생성!!!!!!`);
      let room_id: string;
      room_id = this.players[0].id + '_' + this.players[1].id;
      this.logger.log(`room id : ${room_id}`);
      this.players[0].socket.join(room_id);
      this.players[0].room_id = room_id;
      this.players[1].socket.join(room_id);
      this.players[1].room_id = room_id;
      this.server.to(room_id).emit('joinRoom', room_id);
    }
  }

  @SubscribeMessage('events')
  onEvent(client: any, data: any): Observable<WsResponse<number>> {
    this.logger.log(`game events!!!!!!! : ${client.id}`);
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('move')
  handleMessage(client: Socket, data: string) {
    let player = this.players.find((element) => element.socket == client);
    this.logger.log(`move events!!!!!!! : ${player.id}, ${player.room_id}`);
    client.in(player.room_id).emit('changePostion', 'move!!!!!!!!');
  }
}
