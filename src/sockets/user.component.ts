import { Socket } from 'socket.io';
import { GameComponent } from 'src/games/game.component';

export const USERSTATUS = {
  online: 0,
  offline: 1,
  gaming: 2,
};

export class UserInfo {
  constructor() {
    this.id = '';
    this.status = USERSTATUS.offline;
  }
  socket: Socket;
  id: string;
  status: number;
  gameInfo: GameComponent = new GameComponent();

  setStatusOnline() {
    this.status = USERSTATUS.online;
  }
  setStatusGaming() {
    this.status = USERSTATUS.gaming;
  }
  setStatusOffline() {
    this.status = USERSTATUS.offline;
  }
}
