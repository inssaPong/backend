import { MainGateway } from 'src/sockets/main.gateway';
import { GameObject, GameRoomComponent } from '../game.component';
import { GameGateway } from '../games.gateway';
import nextRound from './nextRound.service';

export default function updateBallPos(
  gameRoom: GameRoomComponent,
  gameGateway: GameGateway,
) {
  // p1 bar
  if (
    gameRoom.ball_x - GameObject.ball_radius <=
      gameRoom.p1_x + GameObject.bar_width &&
    gameRoom.ball_x - GameObject.ball_radius > gameRoom.p1_x &&
    gameRoom.ball_y >= gameRoom.p1_y &&
    gameRoom.ball_y <= gameRoom.p1_y + GameObject.bar_height
  ) {
    gameRoom.ball_x_dir = 1;
  }
  // p2 bar
  //
  else if (
    gameRoom.ball_x + GameObject.ball_radius >= gameRoom.p2_x &&
    gameRoom.ball_x + GameObject.ball_radius <
      gameRoom.p2_x + GameObject.bar_width &&
    gameRoom.ball_y >= gameRoom.p2_y &&
    gameRoom.ball_y <= gameRoom.p2_y + GameObject.bar_height
  ) {
    gameRoom.ball_x_dir = -1;
  }
  // 윗벽
  else if (gameRoom.ball_y <= 0 + GameObject.ball_radius) {
    gameRoom.ball_y_dir = 1;
  }
  // 아래벽
  else if (
    gameRoom.ball_y >
    GameObject.canvas_height - GameObject.ball_radius
  ) {
    gameRoom.ball_y_dir = -1;
  }
  // 왼쪽벽
  else if (gameRoom.ball_x <= 0 + GameObject.ball_radius) {
    gameRoom.p2_score++;
    setTimeout(nextRound, 0, gameRoom, gameGateway);
    return;
  }
  // 오른쪽벽
  else if (gameRoom.ball_x > GameObject.canvas_width - GameObject.ball_radius) {
    gameRoom.p1_score++;
    setTimeout(nextRound, 0, gameRoom, gameGateway);
    return;
  }
  gameRoom.ball_x += 1 * gameRoom.ball_x_dir;
  gameRoom.ball_y += 1 * gameRoom.ball_y_dir;
}
