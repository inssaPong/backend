import { GAME_OBJECT, GameRoomComponent } from '../game.component';
import { GameGateway } from '../games.gateway';
import gameOver from './gameOver.servive';

export default function nextRound(
  gameRoom: GameRoomComponent,
  gameGateway: GameGateway,
) {
  gameRoom.nextRound();
  if (
    gameRoom.p1_score == GAME_OBJECT.FINAL_SCORE ||
    gameRoom.p2_score == GAME_OBJECT.FINAL_SCORE
  ) {
    clearInterval(gameRoom.interval_ball);
    clearInterval(gameRoom.interval_move);
    gameGateway.mainGateway.server
      .to(gameRoom.room_id)
      .emit(
        'game/end',
        gameRoom.p1_id,
        gameRoom.p2_id,
        gameRoom.p1_score,
        gameRoom.p2_score,
      );
    gameGateway.mainGateway.server.to(gameRoom.room_id).emit('game/endCanvas');
    gameOver(gameRoom, gameGateway);
  }
  gameGateway.mainGateway.server
    .to(gameRoom.room_id)
    .emit('game/nextRound', gameRoom.p1_score, gameRoom.p2_score);
}
