import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class FtUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  email: string;

  @IsBoolean()
  isRegistered: boolean;

  @IsBoolean()
  twoFactorStatus: boolean;

  @IsBoolean()
  isAuthenticated: boolean;
}
