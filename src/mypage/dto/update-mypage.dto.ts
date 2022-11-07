import { PartialType } from '@nestjs/swagger';
import { UserInfoDto } from './create-mypage.dto';

export class UpdateUserInfoDto extends PartialType(UserInfoDto) {}
