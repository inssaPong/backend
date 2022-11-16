export const GAMEOBJECT = {
  canvas_width: 300,
  canvas_height: 150,
  ball_radius: 3,
  bar_width: 5,
  bar_height: 20,
  move_pixel: 5,
  margin: 20,
  drawUpdateTime: 50,
  ballSpeed: 10,
  finalScore: 5,
};

export class GameComponent {
  constructor() {
    this.reset();
  }
  p1_id: string;
  p2_id: string;
  room_id: string;

  init(p1_id: string, p2_id: string, room_id: string) {
    this.p1_id = p1_id;
    this.p2_id = p2_id;
    this.room_id = room_id;
  }
  reset() {
    this.p1_id = '';
    this.p2_id = '';
    this.room_id = '';
  }
}

export class GameRoomComponent {
  constructor() {
    this.init();
  }
  room_id: string;
  p1_id: string;
  p2_id: string;
  ball_x: number;
  ball_y: number;
  ball_x_dir: number;
  ball_y_dir: number;
  p1_x: number;
  p1_y: number;
  p2_x: number;
  p2_y: number;
  p1_score: number;
  p2_score: number;
  interval_ball: any;
  interval_move: any;

  init() {
    this.nextRound();
    this.p1_score = 0;
    this.p2_score = 0;
  }
  nextRound() {
    this.ball_x_dir = 1;
    this.ball_y_dir = 1;
    this.ball_x = GAMEOBJECT.canvas_width / 2;
    this.ball_y = GAMEOBJECT.canvas_height / 2;
    this.p1_x = GAMEOBJECT.margin;
    this.p1_y = GAMEOBJECT.canvas_height / 2 - GAMEOBJECT.bar_height / 2;
    this.p2_x = GAMEOBJECT.canvas_width - GAMEOBJECT.margin;
    this.p2_y = GAMEOBJECT.canvas_height / 2 - GAMEOBJECT.bar_height / 2;
  }
}
