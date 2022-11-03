import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorDto {
  @ApiProperty({
    description: 'Authentication number',
    default: '',
    required: true,
  })
  AuthenticationNumber: number; // TODO: 이름 변경. number vs string
}
