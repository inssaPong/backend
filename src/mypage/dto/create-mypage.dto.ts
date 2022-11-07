import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  MaxLength,
  IsNotEmpty,
  MinLength,
  IsArray,
  IsNumber,
} from 'class-validator';

export class UserInfoDto {
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
  readonly twoFactor_status: boolean;
}

export class GameHistoryDto {
  @IsArray()
  @ApiProperty({ description: '게임 기록 리스트' })
  readonly gameHistory: OneGameHistoryDto[];
}

export class OneGameHistoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @MinLength(1)
  @ApiProperty({ description: '승자 아이디' })
  readonly winner: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @MinLength(1)
  @ApiProperty({ description: '패자 아이디' })
  readonly loser: string;
}

export class FollowsDto {
  @ApiProperty({ description: '팔로우 아이디 목록' })
  id: string[] = [];
}

export class GameStatDto {
  @IsNumber()
  @ApiProperty({ description: '승리 수' })
  readonly wins: number;

  @IsNumber()
  @ApiProperty({ description: '패배 수' })
  readonly loses: number;
}
