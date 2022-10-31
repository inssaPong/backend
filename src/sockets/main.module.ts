import { Module } from '@nestjs/common';
import { MainGateway } from './main.gateway';
import { ScheduleService } from './schedule.service';

@Module({
  providers: [MainGateway, ScheduleService],
  // imports: [ScheduleService],
})
export class EventsModule {}
