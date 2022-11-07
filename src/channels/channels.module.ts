import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ChannelsRepository } from './channels.repository';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelsRepository],
})
export class ChannelsModule {}
