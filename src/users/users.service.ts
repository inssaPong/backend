import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DEFAULTIMAGE, Relation_status } from './users.definition';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly usersRepository: UsersRepository) {}

  async getRelationStatus(user_id: string, partner_id: string) : Promise<Relation_status> {
      const relationStatusDB = await this.usersRepository.getRelationStatus(
        user_id,
        partner_id,
      );
      if (relationStatusDB.length == 0) {
        return Relation_status.UNFOLLOW;
      } else if (relationStatusDB.length == 1) {
		if (relationStatusDB[0]['block_status'] == false)
        	return Relation_status.FOLLOW;
		else
			return Relation_status.BLOCK;
      } else {
		this.logger.error(`[${this.getRelationStatus.name}] ${InternalServerErrorException.name} 서버 에러`)
        throw new InternalServerErrorException('서버 에러');
      }
  }

  async onFollowStatus(user_id: string, partner_id: string) {
      const relation_status = await this.usersRepository.getRelationStatus(
        user_id,
        partner_id,
      );
      if (relation_status.length == 1)
        await this.usersRepository.updateFollowStatus(user_id, partner_id);
      else if (relation_status.length == 0)
        await this.usersRepository.insertFollowStatus(user_id, partner_id);
      else {
		this.logger.error(`[${this.onFollowStatus.name}] ${InternalServerErrorException.name} 서버 에러`)
		throw new InternalServerErrorException('서버 에러');
	  }
  }

  async checkUserExist(target_id: string) {
      const databaseResponse = await this.usersRepository.findUser(target_id);
      if (databaseResponse.length == 1) return;
      else if (databaseResponse.length == 0) {
		this.logger.error(`[${this.onFollowStatus.name}] ${NotFoundException.name} 존재하지 않는 유저`)
		throw new NotFoundException(`${target_id}: 존재하지 않는 유저`);
	  }
      else {
		this.logger.error(`[${this.onFollowStatus.name}] ${InternalServerErrorException.name} 서버 에러`)
		throw new InternalServerErrorException('서버 에러');
	  }
  }

  getDefaultImage(): string {
    return DEFAULTIMAGE;
  }

  printObject(objectName: string, object: Object, logger: Logger) {
    logger.debug(`print object <${objectName}> {`);
    for (let [key, value] of Object.entries(object)) {
      logger.debug(`${key}: ${value}`);
    }
    logger.debug('}');
  }

  private printObjectArrayElement(object: Object, logger: Logger) {
    for (let [key, value] of Object.entries(object)) {
      logger.debug(`	${key}: ${value}, `);
    }
  }

  printObjectArray(
    objectName: string,
    objectArray: Array<Object>,
    logger: Logger,
  ) {
    logger.debug(`print object array <${objectName}> [`);
    for (let element of objectArray) {
      this.printObjectArrayElement(element, logger);
    }
    logger.debug(']');
  }
}
