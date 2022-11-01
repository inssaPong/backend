import { MainGateway } from 'src/sockets/main.gateway';
import { GameRoomComponent } from '../game.component';

export default function gameOver(
  gameRoom: GameRoomComponent,
  mainGateway: MainGateway,
) {
  const p1_id: string = gameRoom.p1_id;
  const p2_id: string = gameRoom.p2_id;
  mainGateway.gameRooms = mainGateway.gameRooms.filter(
    (element) => element.room_id != gameRoom.room_id,
  );
  const p1 = mainGateway.users.find((user) => user.id == p1_id);
  if (p1 != undefined) {
    p1.gameInfo.reset();
  }
  const p2 = mainGateway.users.find((user) => user.id == p2_id);
  if (p2 != undefined) {
    p2.gameInfo.reset();
  }
}
