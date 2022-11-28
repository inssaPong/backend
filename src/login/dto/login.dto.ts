import { IsBoolean, IsString, MaxLength } from 'class-validator';

export class FtUserDto {
  @IsString()
  @MaxLength(10)
  id?: string;

  @IsString()
  @MaxLength(30)
  email?: string;

  @IsBoolean()
  isRegistered?: boolean;

  @IsBoolean()
  twoFactorStatus?: boolean;

  @IsBoolean()
  isAuthenticated?: boolean;
}
