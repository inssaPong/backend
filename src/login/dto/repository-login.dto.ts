import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(10)
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(10)
  readonly nickname: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  readonly email: string;

  @IsBoolean()
  @IsNotEmpty()
  @MinLength(1)
  readonly twofactor_status: boolean;

  @IsString()
  readonly avatar: string;
}
