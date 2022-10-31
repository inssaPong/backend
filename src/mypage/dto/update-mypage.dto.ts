import { PartialType } from '@nestjs/swagger';
import { CreateMypageDto } from './create-mypage.dto';

export class updateMypageDto extends PartialType(CreateMypageDto) {}
