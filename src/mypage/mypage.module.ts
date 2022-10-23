import { Module } from '@nestjs/common';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';

@Module({
	controllers: [UsersController],
	providers: [UsersService],
})
export class MypageModule {}
