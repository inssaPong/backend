import { MainGateway } from 'src/sockets/main.gateway';
import { GAMEOBJECT, GameRoomComponent } from '../game.component';
import { GameGateway } from '../games.gateway';
import nextRound from './nextRound.service';

export default function updateBallPos(
  gameRoom: GameRoomComponent,
  gameGateway: GameGateway,
) {
  // p1 bar
  if (
    gameRoom.ball_x - GAMEOBJECT.ball_radius <=
      gameRoom.p1_x + GAMEOBJECT.bar_width &&
    gameRoom.ball_x - GAMEOBJECT.ball_radius > gameRoom.p1_x &&
    gameRoom.ball_y >= gameRoom.p1_y &&
    gameRoom.ball_y <= gameRoom.p1_y + GAMEOBJECT.bar_height
  ) {
    gameRoom.ball_x_dir = 1;
  }
  // p2 bar
  //
  else if (
    gameRoom.ball_x + GAMEOBJECT.ball_radius >= gameRoom.p2_x &&
    gameRoom.ball_x + GAMEOBJECT.ball_radius <
      gameRoom.p2_x + GAMEOBJECT.bar_width &&
    gameRoom.ball_y >= gameRoom.p2_y &&
    gameRoom.ball_y <= gameRoom.p2_y + GAMEOBJECT.bar_height
  ) {
    gameRoom.ball_x_dir = -1;
  }
  // 윗벽
  else if (gameRoom.ball_y <= 0 + GAMEOBJECT.ball_radius) {
    gameRoom.ball_y_dir = 1;
  }
  // 아래벽
  else if (
    gameRoom.ball_y >
    GAMEOBJECT.canvas_height - GAMEOBJECT.ball_radius
  ) {
    gameRoom.ball_y_dir = -1;
  }
  // 왼쪽벽
  else if (gameRoom.ball_x <= 0 + GAMEOBJECT.ball_radius) {
    gameRoom.p2_score++;
    setTimeout(nextRound, 0, gameRoom, gameGateway);
    return;
  }
  // 오른쪽벽
  else if (gameRoom.ball_x > GAMEOBJECT.canvas_width - GAMEOBJECT.ball_radius) {
    gameRoom.p1_score++;
    setTimeout(nextRound, 0, gameRoom, gameGateway);
    return;
  }
  gameRoom.ball_x += 1 * gameRoom.ball_x_dir;
  gameRoom.ball_y += 1 * gameRoom.ball_y_dir;
}
