import { Module } from '@nestjs/common';
import { MypageController } from './mypage.controller';
import { MypageService } from './mypage.service';

@Module({
  controllers: [MypageController],
  providers: [MypageService],
})
export class MypageModule {}
