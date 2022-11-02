import { PartialType } from '@nestjs/swagger';
import { CreateMypageDto } from './create-mypage.dto';

export class UpdateMypageDto extends PartialType(CreateMypageDto) {}
