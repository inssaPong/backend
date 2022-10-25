import { Controller, Get, Query, Patch, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';

// 2-1
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  // 메소드 이름
  // req : id
  // res : { 채널명 }들
  @Get()
  f1(@Query('id') id: string) {
    return Object.assign({});
  }
}
