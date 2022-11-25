import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsNumber,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Relation_status } from '../users.definition';

export class ChanageFollowStatusDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @MinLength(1)
  @ApiProperty({ description: '팔로우할 대상 유저 아이디' })
  readonly partner_id: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ description: '팔로우 여부' })
  readonly follow_status: boolean;
}

// TODO mypage와 dto 중복되는 거 리팩토링하기
// =========아래 DTO들 mypage와 중복되는데 이게 맞나?===========
// TODO gameHistoryDto 굳이 배열로 감싸서 보내는게 아니라 아래의 OneGameHistoryDto를 배열로 만들어서 보내는 걸로 고치기
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

export class GameStatDto {
  @IsNumber()
  @ApiProperty({ description: '승리 수' })
  readonly wins: number;

  @IsNumber()
  @ApiProperty({ description: '패배 수' })
  readonly loses: number;
}

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

  @IsEnum(Relation_status)
  @ApiProperty({ enum: Relation_status, description: '관계 상태' })
  readonly relation_status: Relation_status;

  constructor(
    id: string,
    nickname: string,
    avatar: string,
    relation_status: Relation_status,
  ) {
    this.id = id;
    this.nickname = nickname;
    this.avatar = `${avatar}`;
    this.relation_status = relation_status;
  }
}
