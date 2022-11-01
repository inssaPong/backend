import { Socket } from 'socket.io';
import { GameComponent } from 'src/games/game.component';

export class UserInfo {
  socket: Socket;
  id: string;
  status: number;
  gameInfo: GameComponent = new GameComponent();
}
