import { Socket } from 'socket.io';
import { GameComponent } from 'src/games/game.component';

export const UserStatus = {
  online: 0,
  offline: 1,
  gaming: 2,
};

export class UserInfo {
  constructor() {
    this.id = '';
    this.status = UserStatus.offline;
  }
  socket: Socket;
  id: string;
  status: number;
  gameInfo: GameComponent = new GameComponent();

  setStatusOnline() {
    this.status = UserStatus.online;
  }
  setStatusGaming() {
    this.status = UserStatus.gaming;
  }
  setStatusOffline() {
    this.status = UserStatus.offline;
  }
}
