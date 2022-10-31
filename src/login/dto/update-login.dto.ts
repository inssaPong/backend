import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-login.dto';

export class updateUsereDto extends PartialType(CreateUserDto) {}
