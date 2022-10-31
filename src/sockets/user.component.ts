import { Socket } from 'socket.io';

export const GameObject = {
  canvas_width: 300,
  canvas_height: 90,
  ball_radius: 4,
  bar_width: 8,
  bar_height: 30,
  move_pixel: 1,
  margin: 20,
};

export class UserInfo {
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
  ball_x: number;
  ball_y: number;
  p1_x: number;
  p1_y: number;
  p2_x: number;
  p2_y: number;
  p1_score: number;
  p2_score: number;
  init() {
    this.ball_x = GameObject.canvas_width / 2;
    this.ball_y = GameObject.canvas_height / 2;
    this.p1_x = GameObject.margin;
    this.p1_y = GameObject.canvas_height / 2 + GameObject.bar_height / 2;
    this.p2_x = GameObject.canvas_width - GameObject.margin;
    this.p2_y = GameObject.canvas_height / 2 + GameObject.bar_height / 2;
    this.p1_score = 0;
    this.p2_score = 0;
  }
}
