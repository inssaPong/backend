import { ApiProperty } from '@nestjs/swagger';

export class ResponseGetChannelsListDto {
  @ApiProperty({
    description: '[Response] [{channel_id, channel_name, has_password}, ...]',
    required: true,
    default: [
      { channel_id: 1, channel_name: 'channel 1', has_password: false },
      { channel_id: 2, channel_name: 'channel 2', has_password: true },
    ],
  })
  example: Array<JSON>;
}

export class ResponseGetEnteredChannelsListDto {
  @ApiProperty({
    description: '[Response] [{channel_id, channel_name}, ...]',
    required: true,
    default: [
      { channel_id: 1, channel_name: 'channel 1' },
      { channel_id: 2, channel_name: 'channel 2' },
    ],
  })
  example: Array<JSON>;
}

// TODO: 삭제. 사용하지 않는다면 삭제
// export class ResponseGetUserInfoInChannelDto {
//   @ApiProperty({
//     description: '[Response] [{id}, ...]',
//     required: true,
//     default: [
//       { id: 'seungoh' }, // TODO: 질문. id: '$id' 형식이어야하는지?
//       { id: 'dason' },
//       { id: 'hyson' },
//       { id: 'sehyan' },
//       { id: 'sanjeon' },
//     ],
//   })
//   example: Array<JSON>;
// }

export class RequestBodyUserListInChannelDto {
  @ApiProperty({
    description: '[Request Body] 채널에 있는 유저들 리스트',
    required: true,
    default: ['seungoh', 'dason', 'hyson', 'sehyan', 'sanjeon'],
  })
  example: Array<String>;
}

export class ResponseUserStatusInChannelDto {
  @ApiProperty({
    description: '[Reponse] [{channel_id, user_status}, ...]',
    required: true,
    default: [
      { user_id: 'seungoh', user_status: '1' },
      { user_id: 'dason', user_status: '2' },
      { user_id: 'hyson', user_status: '3' },
      { user_id: 'sehyan', user_status: '2' },
      { user_id: 'sehyan', user_status: '1' },
    ],
  })
  example: Array<JSON>;
}

export class RequestBodyChannelNameAndPwDto {
  @ApiProperty({
    description: '[Request Body] Channel name',
    required: true,
    default: 'channel 42',
  })
  channel_name: string;

  @ApiProperty({
    description: '[Request Body] Channel password',
    required: true,
    default: '0000',
  })
  channel_pw: string;
}

export class ResponseChannelIdDto {
  @ApiProperty({
    description: '[Response] Channel ID',
    required: true,
    default: 42,
  })
  channel_id: number;
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
