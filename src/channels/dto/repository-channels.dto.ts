import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class ChannelTableDto {
  @IsNumber()
  @IsNotEmpty()
  @MaxLength(10)
  readonly id: number;

  @IsString()
  @IsNotEmpty()
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
