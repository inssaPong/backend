import { Socket } from 'socket.io';

export class GameComponent {
  p1: string;
  p2: string;
  room_id: string;
  p1_score: number;
  p2_score: number;
}

export class Player {
  socket: Socket;
  id: string;
  room_id: string;
}
