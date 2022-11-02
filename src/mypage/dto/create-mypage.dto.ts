import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  MaxLength,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreateMypageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @MinLength(1)
  @ApiProperty({ description: '닉네임' })
  readonly nickname: string;

  @ApiProperty({ description: '프로필 사진' })
  readonly avatar: string;

  @IsBoolean()
  @ApiProperty({ description: '2차 인증 여부' })
  readonly twoFactor: boolean;
}
