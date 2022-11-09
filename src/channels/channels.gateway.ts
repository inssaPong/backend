import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MainGateway } from 'src/sockets/main.gateway';

@WebSocketGateway({ cors: true })
export class CannelGateway {
  constructor(private mainGateway: MainGateway) {}
  logger: Logger = new Logger('GameGameway');

  @SubscribeMessage('game/watch')
  gameCatch(client: Socket, id: string) {}
}
