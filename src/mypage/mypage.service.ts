import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DEFAULTIMAGE } from 'src/users/users.definition';
import { UpdateUserInfoDto } from './dto/update-mypage.dto';
import { MypageRepository } from './mypage.repository';

@Injectable()
export class MypageService {
  private readonly logger: Logger = new Logger(MypageService.name);
  constructor(private readonly mypageRepository: MypageRepository) {}
  getDefaultImage(): string {
    return DEFAULTIMAGE;
  }

  async updateUserInfo(id: string, body: UpdateUserInfoDto) {
    try {
      for (let [key, value] of Object.entries(body)) {
        if (key == 'nickname')
          await this.mypageRepository.updateNickname(id, value);
        else if (key == 'avatar') {
          if (body.avatar == null) await this.mypageRepository.deleteAvatar(id);
          else await this.mypageRepository.updateAvatar(id, value);
        } else if (key == 'twofactor_status')
          await this.mypageRepository.updateTwofactor(id, value);
        else throw new BadRequestException('DTO에 맞지 않는 객체');
      }
    } catch (error) {
      this.logger.error(`${this.updateUserInfo.name}: ${error}`);
      throw error;
    }
  }

  printObject(objectName: string, object: Object, logger: Logger) {
    logger.debug(`print object <${objectName}> {`);
    for (let [key, value] of Object.entries(object)) {
      logger.debug(`	${key}: ${value}`);
    }
    logger.debug('}');
  }

  private printObjectArrayElement(object: Object, logger: Logger) {
    for (let [key, value] of Object.entries(object)) {
      logger.debug(`	${key}: ${value}, `);
    }
  }

  printStringArray(name: string, stringArray: string[], logger: Logger) {
    logger.debug(`print string array <${name}> [`);
    for (let element of stringArray) {
      logger.debug(`	${element}, `);
    }
    logger.debug(']');
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
