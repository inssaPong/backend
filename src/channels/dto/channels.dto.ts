import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(0, 4)
  password: string;
}

export class EnterChannelDto {
  @IsString()
  @Length(0, 4)
  password: string;
}

export class ResponseChannelDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  name?: string;

  @IsBoolean()
  @IsNotEmpty()
  has_password?: boolean;
}

// Repository
export class ChannelMemberTableDto {
  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  readonly name: string;

  @IsNumber()
  @IsNotEmpty()
  readonly channel_id: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(10)
  readonly user_id: string;

  @IsBoolean()
  @IsNotEmpty()
  readonly ban_status: boolean;

  @IsNumber()
  @IsNotEmpty()
  @Length(1)
  readonly authority: number;

  @IsNumber()
  @MaxLength(60)
  readonly password: string;
}
