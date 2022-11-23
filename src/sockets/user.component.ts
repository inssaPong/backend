import { Socket } from 'socket.io';
import { GameComponent } from 'src/games/game.component';

export const USER_STATUS = {
  ONLINE: 0,
  OFFLINE: 1,
  GAMING: 2,
};

export class UserInfo {
  constructor() {
    this.id = '';
    this.status = USER_STATUS.OFFLINE;
  }
  socket: Socket;
  id: string;
  status: number;
  gameInfo: GameComponent = new GameComponent();

  setStatusOnline() {
    this.status = USER_STATUS.ONLINE;
  }
  setStatusGaming() {
    this.status = USER_STATUS.GAMING;
  }
  setStatusOffline() {
    this.status = USER_STATUS.OFFLINE;
  }
}
