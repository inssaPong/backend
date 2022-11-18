import { GameRoomComponent } from '../game.component';
import { GameGateway } from '../games.gateway';

export default function failSaveResult(
  gameRoom: GameRoomComponent,
  gameGateway: GameGateway,
) {
  const p1 = gameGateway.mainGateway.users.find(
    (user) => user.id == gameRoom.p1_id,
  );
  if (p1 != undefined) {
    p1.socket.emit('DBError');
  }
  const p2 = gameGateway.mainGateway.users.find(
    (user) => user.id == gameRoom.p2_id,
  );
  if (p2 != undefined) {
    p2.socket.emit('DBError');
  }
}
