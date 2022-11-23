import { MainGateway } from 'src/sockets/main.gateway';
import { GAME_OBJECT, GameRoomComponent } from '../game.component';
import { GameGateway } from '../games.gateway';
import nextRound from './nextRound.service';

export default function updateBallPos(
  gameRoom: GameRoomComponent,
  gameGateway: GameGateway,
) {
  // p1 bar
  if (
    gameRoom.ball_x - GAME_OBJECT.BALL_RADIUS <=
      gameRoom.p1_x + GAME_OBJECT.BAR_WIDTH &&
    gameRoom.ball_x - GAME_OBJECT.BALL_RADIUS > gameRoom.p1_x &&
    gameRoom.ball_y >= gameRoom.p1_y &&
    gameRoom.ball_y <= gameRoom.p1_y + GAME_OBJECT.BAR_HEIGHT
  ) {
    gameRoom.ball_x_dir = 1;
  }
  // p2 bar
  //
  else if (
    gameRoom.ball_x + GAME_OBJECT.BALL_RADIUS >= gameRoom.p2_x &&
    gameRoom.ball_x + GAME_OBJECT.BALL_RADIUS <
      gameRoom.p2_x + GAME_OBJECT.BAR_WIDTH &&
    gameRoom.ball_y >= gameRoom.p2_y &&
    gameRoom.ball_y <= gameRoom.p2_y + GAME_OBJECT.BAR_HEIGHT
  ) {
    gameRoom.ball_x_dir = -1;
  }
  // 윗벽
  else if (gameRoom.ball_y <= 0 + GAME_OBJECT.BALL_RADIUS) {
    gameRoom.ball_y_dir = 1;
  }
  // 아래벽
  else if (
    gameRoom.ball_y >
    GAME_OBJECT.CANVAS_HEIGHT - GAME_OBJECT.BALL_RADIUS
  ) {
    gameRoom.ball_y_dir = -1;
  }
  // 왼쪽벽
  else if (gameRoom.ball_x <= 0 + GAME_OBJECT.BALL_RADIUS) {
    gameRoom.p2_score++;
    setTimeout(nextRound, 0, gameRoom, gameGateway);
    return;
  }
  // 오른쪽벽
  else if (
    gameRoom.ball_x >
    GAME_OBJECT.CANVAS_WIDTH - GAME_OBJECT.BALL_RADIUS
  ) {
    gameRoom.p1_score++;
    setTimeout(nextRound, 0, gameRoom, gameGateway);
    return;
  }
  gameRoom.ball_x += 1 * gameRoom.ball_x_dir;
  gameRoom.ball_y += 1 * gameRoom.ball_y_dir;
}
