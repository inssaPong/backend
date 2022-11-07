import { ApiProperty } from '@nestjs/swagger';

export class RequestBodyInputTwoFactorCodeDto {
  @ApiProperty({
    description: '[Request Body] 유저가 입력한 2차 인증 코드',
    required: true,
    default: '',
  })
  CertificationNumber: string;
}
