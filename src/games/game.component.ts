export const GAME_OBJECT = {
  CANVAS_WIDTH: 300,
  CANVAS_HEIGHT: 150,
  BALL_RADIUS: 3,
  BAR_WIDTH: 5,
  BAR_HEIGHT: 20,
  MOVE_PIXEL: 5,
  MARGIN: 20,
  DRAW_UPDATE_TIME: 50,
  BALL_SPEED: 10,
  FINAL_SCORE: 50,
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
    this.ball_x = GAME_OBJECT.CANVAS_WIDTH / 2;
    this.ball_y = GAME_OBJECT.CANVAS_HEIGHT / 2;
    this.p1_x = GAME_OBJECT.MARGIN;
    this.p1_y = GAME_OBJECT.CANVAS_HEIGHT / 2 - GAME_OBJECT.BAR_HEIGHT / 2;
    this.p2_x = GAME_OBJECT.CANVAS_WIDTH - GAME_OBJECT.MARGIN;
    this.p2_y = GAME_OBJECT.CANVAS_HEIGHT / 2 - GAME_OBJECT.BAR_HEIGHT / 2;
  }
}
