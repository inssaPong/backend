import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorDto {
  @ApiProperty({
    description: 'Certified number',
    default: '', // TODO: number vs string
    required: true,
  })
  CertifiedNumber: number; // TODO: 이름 변경. number vs string
}
