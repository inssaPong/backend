import { Server } from 'socket.io';
import { MainGateway } from './main.gateway';
import { GameObject, GameRoomComponent } from './user.component';

export function updateBallPos(
  gameRoom: GameRoomComponent,
  server: MainGateway,
) {
  // 윗벽l
  if (gameRoom.ball_y <= 0 + GameObject.ball_radius) {
    gameRoom.ball_y_dir = 1;
  }
  // 아래벽
  if (gameRoom.ball_y > GameObject.canvas_height - GameObject.ball_radius) {
    gameRoom.ball_y_dir = -1;
  }
  // 왼쪽벽
  if (gameRoom.ball_x <= 0 + GameObject.ball_radius) {
    gameRoom.p2_score++;
    setTimeout(nextRound, 0, gameRoom, server);
  }
  // 오른쪽벽
  if (gameRoom.ball_x > GameObject.canvas_width - GameObject.ball_radius) {
    gameRoom.p1_score++;
    setTimeout(nextRound, 0, gameRoom, server);
  }
  // p1 bar
  if (
    gameRoom.ball_x - GameObject.ball_radius <=
      gameRoom.p1_x + GameObject.bar_width &&
    gameRoom.ball_y > gameRoom.p1_y &&
    gameRoom.ball_y <= gameRoom.p1_y + GameObject.bar_height
  ) {
    gameRoom.ball_x_dir = 1;
  }
  // p2 bar
  if (
    gameRoom.ball_x + GameObject.ball_radius >= gameRoom.p2_x &&
    gameRoom.ball_y > gameRoom.p2_y &&
    gameRoom.ball_y <= gameRoom.p2_y + GameObject.bar_height
  ) {
    gameRoom.ball_x_dir = -1;
  }
  gameRoom.ball_x += 1 * gameRoom.ball_x_dir;
  gameRoom.ball_y += 1 * gameRoom.ball_y_dir;
}

export function getPosition(gameRoom: GameRoomComponent, server: Server) {
  server
    .to(gameRoom.room_id)
    .emit(
      'draw',
      gameRoom.ball_x,
      gameRoom.ball_y,
      gameRoom.p1_x,
      gameRoom.p1_y,
      gameRoom.p2_x,
      gameRoom.p2_y,
    );
}

export function nextRound(gameRoom: GameRoomComponent, server: MainGateway) {
  gameRoom.nextRound();
  if (
    gameRoom.p1_score == GameObject.finalScore ||
    gameRoom.p2_score == GameObject.finalScore
  ) {
    clearInterval(gameRoom.interval_ball);
    clearInterval(gameRoom.interval_move);
    server.server
      .to(gameRoom.room_id)
      .emit(
        'gameOver',
        gameRoom.p1_id,
        gameRoom.p2_id,
        gameRoom.p1_score,
        gameRoom.p2_score,
      );
    // database에 결과값 저장!!!!!!!!!!!
    server.gameOver(gameRoom);
  }
  server.server
    .to(gameRoom.room_id)
    .emit('nextRound', gameRoom.p1_score, gameRoom.p2_score);
}
