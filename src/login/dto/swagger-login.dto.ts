import { ApiProperty } from '@nestjs/swagger';

export class RequestEditProfileDto {
  @ApiProperty({ description: '유저 id' })
  nickname: string;

  @ApiProperty({ description: '아바타' })
  avatar: string;
}

export class RequestConfirmCertificationNumberDTO {
  @ApiProperty({
    description: '유저가 입력한 2차 인증 코드',
    default: '',
  })
  certificationNumber: string;
}
