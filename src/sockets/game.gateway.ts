import { Logger } from '@nestjs/common';
import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
  } from '@nestjs/websockets';
  import { from, Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
	import { Socket } from 'socket.io';
  import { Server } from 'ws';
  
  @WebSocketGateway({ namespace: 'game' })
  export class GameGateway {
	@WebSocketServer()
	server: Server;
  private logger: Logger = new Logger('AppGateway');

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client Disconnected : ${client.id}`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client Connected : ${client.id}`);
	}

	@SubscribeMessage('events')
	onEvent(client: any, data: any): Observable<WsResponse<number>> {
		this.logger.log(`game events!!!!!!! : ${client.id}`);
		return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
	}
}
