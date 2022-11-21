import { GAMEOBJECT, GameRoomComponent } from '../game.component';
import { GameGateway } from '../games.gateway';
import failSaveResult from './failSaveResult';

export default async function gameOver(
  gameRoom: GameRoomComponent,
  gameGateway: GameGateway,
) {
  const p1_id: string = gameRoom.p1_id;
  const p2_id: string = gameRoom.p2_id;
  gameGateway.gameRooms = gameGateway.gameRooms.filter(
    (element) => element.room_id != gameRoom.room_id,
  );
  const p1 = gameGateway.mainGateway.users.find((user) => user.id == p1_id);
  if (p1 != undefined) {
    p1.gameInfo.reset();
    p1.setStatusOnline();
  }
  const p2 = gameGateway.mainGateway.users.find((user) => user.id == p2_id);
  if (p2 != undefined) {
    p2.gameInfo.reset();
    p2.setStatusOnline();
  }

  let winner_id;
  let loser_id;
  if (gameRoom.p1_score == GAMEOBJECT.finalScore) {
    winner_id = gameRoom.p1_id;
    loser_id = gameRoom.p2_id;
  } else {
    winner_id = gameRoom.p2_id;
    loser_id = gameRoom.p1_id;
  }
  const status_code = await gameGateway.gamesRepository.insertGameHistory(
    winner_id,
    loser_id,
  );
  if (status_code == 500) {
    failSaveResult(gameRoom, gameGateway);
  }
}
