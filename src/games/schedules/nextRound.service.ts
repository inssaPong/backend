import { MainGateway } from 'src/sockets/main.gateway';
import { GameObject, GameRoomComponent } from '../game.component';
import gameOver from './gameOver.servive';

export default function nextRound(
  gameRoom: GameRoomComponent,
  mainGateway: MainGateway,
) {
  gameRoom.nextRound();
  if (
    gameRoom.p1_score == GameObject.finalScore ||
    gameRoom.p2_score == GameObject.finalScore
  ) {
    clearInterval(gameRoom.interval_ball);
    clearInterval(gameRoom.interval_move);
    mainGateway.server
      .to(gameRoom.room_id)
      .emit(
        'game/end',
        gameRoom.p1_id,
        gameRoom.p2_id,
        gameRoom.p1_score,
        gameRoom.p2_score,
      );
    // database에 결과값 저장!!!!!!!!!!!
    gameOver(gameRoom, mainGateway);
  }
  mainGateway.server
    .to(gameRoom.room_id)
    .emit('game/nextRound', gameRoom.p1_score, gameRoom.p2_score);
}
