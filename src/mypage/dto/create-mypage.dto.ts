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
  @ApiProperty({ description: '아이디' })
  readonly id: string;

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
  readonly twofactor_status: boolean;
}

// TODO users의 GameHistoryDto와 마찬가지로 배열을 dto로 만드는 게 아니라 OneGameHistoryDto의 배열로 보내기
export class GameHistoryDto {
  @IsArray()
  @ApiProperty({ description: '게임 기록 리스트' })
  readonly gameHistory: OneGameHistoryDto[];
}

export class OneGameHistoryDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '게임 전적 아이디' })
  readonly id: string;

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

// TODO 이 부분도 굳이 배열을 Dto로 안 묶고 follow 자체를 string dto로 만들어서 그걸 배열로 보내는 걸로 바꾸기
export class FollowsDto {
  @ApiProperty({ description: '팔로우 아이디 목록' })
  readonly follow: string[];
}

export class GameStatDto {
  @IsNumber()
  @ApiProperty({ description: '승리 수' })
  readonly wins: number;

  @IsNumber()
  @ApiProperty({ description: '패배 수' })
  readonly loses: number;
}
