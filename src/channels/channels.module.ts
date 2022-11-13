import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MainSocketModule } from 'src/sockets/main.module';
import { ChannelsController } from './channels.controller';
import { ChannelGateway } from './channels.gateway';
import { ChannelsRepository } from './channels.repository';
import { ChannelsService } from './channels.service';

@Module({
  imports: [DatabaseModule, MainSocketModule],
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelGateway, ChannelsRepository],
})
export class ChannelsModule {}
