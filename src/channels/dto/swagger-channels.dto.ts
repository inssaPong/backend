import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

// Request
export class RequestCreateChannelDto {
  @ApiProperty({
    description: '채널 이름',
    default: 'channel 42',
  })
  name: string;

  @ApiProperty({
    description: '채널 비밀번호',
    default: '',
  })
  password: string;
}

export class RequestEnterChannelDto {
  @ApiProperty({
    description: '채널 비밀번호',
    default: '',
  })
  password: string;
}

// Response
export class ResponseCreateChannelDto {
  @ApiProperty({
    description: '[Response] Channel ID',
    required: true,
    default: 42,
  })
  id: number;
}

export class ResponseGetAvailableChannelListDto {
  @ApiProperty({
    description: '[Response] [{channel_id, channel_name, has_password}, ...]',
    required: true,
    default: [
      { id: 1, name: 'channel 1', has_password: false },
      { id: 2, name: 'channel 2', has_password: true },
    ],
  })
  example: Object[];
}

export class ResponseGetJoinedChannelListDto {
  @ApiProperty({
    description: '[Response] [{channel_id, channel_name}, ...]',
    required: true,
    default: [
      { id: 1, name: 'channel 1' },
      { id: 2, name: 'channel 2' },
    ],
  })
  example: Object[];
}

export class ResponseUsersIdInChannelDto {
  @ApiProperty({
    description: '[Reponse] [{user_id}, ...]',
    required: true,
    default: [
      { id: 'seungoh' },
      { id: 'dason' },
      { id: 'hyson' },
      { id: 'sehyan' },
      { id: 'sanjeon' },
    ],
  })
  example: Object[];
}
