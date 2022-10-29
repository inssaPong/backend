import { Socket } from 'socket.io';

export class UserInfo {
  // constructor(private readonly gameComponent: GameComponent) {}
  socket: Socket;
  id: string;
  status: number;
  gameInfo: GameComponent = new GameComponent();
}

export class GameComponent {
  p1_id: string;
  p2_id: string;
  room_id: string;
  init(p1_id: string, p2_id: string, room_id: string) {
    this.p1_id = p1_id;
    this.p2_id = p2_id;
    this.room_id = room_id;
  }
}

export class GameRoomComponent {
  room_id: string;
  p1_id: string;
  p2_id: string;
  p1_x: number;
  p1_y: number;
  p2_x: number;
  p2_y: number;
  p1_score: number;
  p2_score: number;
  init() {
    this.p1_x = 20;
    this.p1_y = 50;
    this.p2_x = 200;
    this.p2_y = 50;
    this.p1_score = 0;
    this.p2_score = 0;
  }
}
