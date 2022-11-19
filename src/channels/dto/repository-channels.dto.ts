import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChannelDto {
  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  readonly name: string;

  @IsString()
  @Length(4)
  readonly password: string;
}

export class ChannelMemberTableDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(10)
  user_id: string;

  @IsNumber()
  @IsNotEmpty()
  channel_id: number;

  @IsBoolean()
  @IsNotEmpty()
  ban_status: boolean;

  @IsString()
  @IsNotEmpty()
  @Length(1)
  authority: string;
}
