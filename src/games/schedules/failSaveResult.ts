import { GameRoomComponent } from '../game.component';
import { GameGateway } from '../games.gateway';

export default function failSaveResult(
  gameRoom: GameRoomComponent,
  gameGateway: GameGateway,
) {
  gameGateway.mainGateway.server.to(gameRoom.room_id).emit('game/failSave');
}
