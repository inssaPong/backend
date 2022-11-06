import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorDto {
  @ApiProperty({
    description: 'Certified number',
    default: '',
    required: true,
  })
  CertificationNumber: string;
}
