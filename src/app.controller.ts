import { Controller, Get, Query, Patch, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';

// 2-1
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  home() {
    return 'home';
  }
}
