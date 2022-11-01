import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MypageController } from './mypage.controller';
import { MypageRepository } from './mypage.repository';
import { MypageService } from './mypage.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MypageController],
  providers: [MypageService, MypageRepository],
})
export class MypageModule {}
