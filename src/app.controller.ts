import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// 2-1
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

// 1-1, 1-2, 1-3, 1-4
@Controller("/login")
export class Login {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

// 2-2, 2-4
@Controller("/users")
export class Users {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

// 3-1, 3-2
@Controller("/games")
export class Games {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

// 4-0, 4-1, 4-2, 4-3
@Controller("/chats")
export class Chats {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
