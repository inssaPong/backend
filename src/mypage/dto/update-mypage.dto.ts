import { PartialType } from '@nestjs/swagger';
import { MypageInfoDto } from './create-mypage.dto';

export class UpdateMypageInfoDto extends PartialType(MypageInfoDto) {}
