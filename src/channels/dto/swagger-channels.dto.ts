import { ApiProperty } from '@nestjs/swagger';

export class ResponseGetChannelListDto {
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

export class ResponseGetEnteredChannelListDto {
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

export class ResponseUserStatusInChannelDto {
  @ApiProperty({
    description: '[Reponse] [{user_id, user_status}, ...]',
    required: true,
    default: [
      { user_id: 'seungoh', user_status: '1' },
      { user_id: 'dason', user_status: '2' },
      { user_id: 'hyson', user_status: '3' },
      { user_id: 'sehyan', user_status: '2' },
      { user_id: 'sehyan', user_status: '1' },
    ],
  })
  example: Object[];
}

export class RequestBodyChannelNameAndPwDto {
  @ApiProperty({
    description: '[Request Body] Channel name',
    required: true,
    default: 'channel 42',
  })
  name: string;

  @ApiProperty({
    description: '[Request Body] Channel password',
    required: true,
    default: '0000',
  })
  pw: string;
}

export class ResponseChannelIdDto {
  @ApiProperty({
    description: '[Response] Channel ID',
    required: true,
    default: 42,
  })
  id: number;
}

export class RequestBodyConnectDmDto {
  @ApiProperty({
    description: '[Request Body] Sender ID',
    default: 'dason',
    required: true,
  })
  sender_id: number;

  @ApiProperty({
    description: '[Request Body] Reciever ID',
    default: 'sanjeon',
    required: true,
  })
  reciever_id: number;
}
