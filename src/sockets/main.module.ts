import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MainGateway } from './main.gateway';
import { MainSocketRepository } from './main.repository';

@Module({
  imports: [DatabaseModule],
  providers: [MainGateway, MainSocketRepository],
  exports: [MainGateway],
})
export class MainSocketModule {}
