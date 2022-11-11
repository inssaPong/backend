import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, IsNumber, IsNotEmpty, MaxLength, MinLength, IsBoolean } from "class-validator";

export class ChanageFollowStatusDto{
	@IsString()
	@IsNotEmpty()
	@MaxLength(10)
	@MinLength(1)
	@ApiProperty({description: '유저 아이디'})
	readonly user_id: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(10)
	@MinLength(1)
	@ApiProperty({description: '팔로우할 대상 유저 아이디'})
	readonly partner_id: string;

	@IsNotEmpty()
	@IsBoolean()
	@ApiProperty({description: '팔로우 여부'})
	readonly follow_status: boolean;
}

export class ApplyBlockDto{
	@IsString()
	@IsNotEmpty()
	@MaxLength(10)
	@MinLength(1)
	@ApiProperty({description: '유저 아이디'})
	readonly user_id: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(10)
	@MinLength(1)
	@ApiProperty({description: '차단할 대상 유저 아이디'})
	readonly block_id: string;
}

// TODO mypage와 dto 중복되는 거 리팩토링하기
// =========아래 DTO들 mypage와 중복되는데 이게 맞나?===========
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
	@ApiProperty({ description: '팔로우 여부' })
	readonly follow_status: boolean;
	constructor(nickname, avatar, follow_status) {
		this.nickname = nickname;
		this.avatar = avatar;
		this.follow_status = follow_status;
	}
  }
