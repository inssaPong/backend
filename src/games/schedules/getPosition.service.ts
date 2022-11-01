import { Server } from 'socket.io';
import { GameRoomComponent } from '../game.component';

export default function getPosition(
  gameRoom: GameRoomComponent,
  server: Server,
) {
  server
    .to(gameRoom.room_id)
    .emit(
      'game/draw',
      gameRoom.ball_x,
      gameRoom.ball_y,
      gameRoom.p1_x,
      gameRoom.p1_y,
      gameRoom.p2_x,
      gameRoom.p2_y,
    );
}
