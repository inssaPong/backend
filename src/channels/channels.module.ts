import { CacheModule, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MainSocketModule } from 'src/sockets/main.module';
import { ChannelsController } from './channels.controller';
import { ChannelsGateway } from './channels.gateway';
import { ChannelsRepository } from './channels.repository';
import { ChannelsService } from './channels.service';

@Module({
  imports: [
    DatabaseModule,
    MainSocketModule,
    CacheModule.register(),
    MainSocketModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelsGateway, ChannelsRepository],
})
export class ChannelsModule {}
