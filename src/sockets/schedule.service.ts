import { Injectable } from '@nestjs/common';
import { GameRoomComponent } from './user.component';

@Injectable()
export class ScheduleService {
  static updateBallPos(gameRoom: GameRoomComponent) {
    gameRoom.ball_x++;
    gameRoom.ball_y++;
  }
}
