import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DEFAULTIMAGE } from './users.definition';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly usersRepository: UsersRepository) {}

  async getFollowStatus(user_id: string, partner_id: string) {
    try {
      const followStatusDB = await this.usersRepository.getFollowStatus(
        user_id,
        partner_id,
      );
      if (followStatusDB.length == 0) {
        return false;
      } else if (followStatusDB.length == 1) {
        return true;
      } else {
        throw InternalServerErrorException;
      }
    } catch (error) {
      this.logger.error(`${this.getFollowStatus.name}: ${error}`);
      throw error;
    }
  }

  async onFollowStatus(user_id: string, partner_id: string) {
    try {
      const relation_status = await this.usersRepository.getRelationStatus(
        user_id,
        partner_id,
      );
      if (relation_status.length == 1)
        await this.usersRepository.updateFollowStatus(user_id, partner_id);
      else if (relation_status.length == 0)
        await this.usersRepository.insertFollowStatus(user_id, partner_id);
      else throw InternalServerErrorException;
    } catch (error) {
      this.logger.error(`${this.onFollowStatus.name}: ${error}`);
      throw error;
    }
  }

  async checkUserExist(target_id: string) {
    try {
      const databaseResponse = await this.usersRepository.findUser(target_id);
      if (databaseResponse.length == 1) return;
      else if (databaseResponse.length == 0) throw new NotFoundException();
      else throw InternalServerErrorException;
    } catch (error) {
      this.logger.error(`${this.checkUserExist.name}: ${error}`);
      throw error;
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
