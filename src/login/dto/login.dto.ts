import { ApiProperty } from '@nestjs/swagger';

export class FtUserDto {
  id: string;
  email: string;
  isUserExist: boolean;
  twoFactorStatus: boolean;
  isAuthenticated: boolean;
}

export class RequestEditProfileDto {
  @ApiProperty({ description: '유저 id' })
  nickname: string;

  @ApiProperty({ description: '아바타' })
  avatar: string;
}
