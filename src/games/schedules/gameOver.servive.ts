import { GameRoomComponent } from '../game.component';
import { GameGateway } from '../games.gateway';

export default function gameOver(
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
  // database에 결과값 저장!!!!!!!!!!!
}
