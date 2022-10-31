import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  IsNotEmpty,
  MinLength,
  IsEmail,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @MinLength(1)
  @ApiProperty({ description: '아이디' })
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @MinLength(1)
  @ApiProperty({ description: '닉네임' })
  readonly nickname: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(30)
  @MinLength(1)
  @ApiProperty({ description: '이메일' })
  readonly email: string;

  // TODO IsBase32? IsBase64?
  @ApiProperty({ description: '아바타' })
  readonly avatar: File;
}
