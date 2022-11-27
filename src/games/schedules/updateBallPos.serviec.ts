import { GAME_OBJECT, GameRoomComponent } from '../game.component';
import { GameGateway } from '../games.gateway';
import nextRound from './nextRound.service';

export default function updateBallPos(
  gameRoom: GameRoomComponent,
  gameGateway: GameGateway,
) {
  if (ballHittedP1Bar(gameRoom)) {
    gameRoom.ball_x_dir = 1;
  } else if (ballHittedP2Bar(gameRoom)) {
    gameRoom.ball_x_dir = -1;
  } else if (ballHittedUpperWall(gameRoom)) {
    gameRoom.ball_y_dir = 1;
  } else if (ballHittedLowerWall(gameRoom)) {
    gameRoom.ball_y_dir = -1;
  } else if (ballHittedLeftWall(gameRoom)) {
    gameRoom.p2_score++;
    setTimeout(nextRound, 0, gameRoom, gameGateway);
    return;
  } else if (ballHittedRightWall(gameRoom)) {
    gameRoom.p1_score++;
    setTimeout(nextRound, 0, gameRoom, gameGateway);
    return;
  }
  gameRoom.ball_x += 1 * gameRoom.ball_x_dir;
  gameRoom.ball_y += 1 * gameRoom.ball_y_dir;
}

function ballHittedP1Bar(gameRoom: GameRoomComponent) {
  if (
    gameRoom.ball_x - GAME_OBJECT.BALL_RADIUS <=
      gameRoom.p1_x + GAME_OBJECT.BAR_WIDTH &&
    gameRoom.ball_x - GAME_OBJECT.BALL_RADIUS > gameRoom.p1_x &&
    gameRoom.ball_y >= gameRoom.p1_y &&
    gameRoom.ball_y <= gameRoom.p1_y + GAME_OBJECT.BAR_HEIGHT
  ) {
    return true;
  } else {
    return false;
  }
}

function ballHittedP2Bar(gameRoom: GameRoomComponent) {
  if (
    gameRoom.ball_x + GAME_OBJECT.BALL_RADIUS >= gameRoom.p2_x &&
    gameRoom.ball_x + GAME_OBJECT.BALL_RADIUS <
      gameRoom.p2_x + GAME_OBJECT.BAR_WIDTH &&
    gameRoom.ball_y >= gameRoom.p2_y &&
    gameRoom.ball_y <= gameRoom.p2_y + GAME_OBJECT.BAR_HEIGHT
  ) {
    return true;
  } else {
    return false;
  }
}

function ballHittedUpperWall(gameRoom: GameRoomComponent) {
  if (gameRoom.ball_y <= 0 + GAME_OBJECT.BALL_RADIUS) {
    return true;
  } else {
    return false;
  }
}

function ballHittedLowerWall(gameRoom: GameRoomComponent) {
  if (gameRoom.ball_y > GAME_OBJECT.CANVAS_HEIGHT - GAME_OBJECT.BALL_RADIUS) {
    return true;
  } else {
    return false;
  }
}

function ballHittedLeftWall(gameRoom: GameRoomComponent) {
  if (gameRoom.ball_x <= 0 + GAME_OBJECT.BALL_RADIUS) {
    return true;
  } else {
    return false;
  }
}

function ballHittedRightWall(gameRoom: GameRoomComponent) {
  if (gameRoom.ball_x > GAME_OBJECT.CANVAS_WIDTH - GAME_OBJECT.BALL_RADIUS) {
    return true;
  } else {
    return false;
  }
}
