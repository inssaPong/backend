import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { DEFAULTIMAGE } from 'src/users/users.definition';
import { UpdateMypageInfoDto } from './dto/update-mypage.dto';
import { MypageRepository } from './mypage.repository';

@Injectable()
export class MypageService {
  private readonly logger: Logger = new Logger(MypageService.name);
  constructor(private readonly mypageRepository: MypageRepository) {}
  getDefaultImage(): string {
    return DEFAULTIMAGE;
  }

  async updateMypageInfo(id: string, body: UpdateMypageInfoDto) {
		const result = await this.mypageRepository.getUserIdByNickname(body.nickname);
		if (result.length > 0) {
			if (result[0]['id'] != id) {
				this.logger.error(`[${this.updateMypageInfo.name}] Conflict 중복된 닉네임`);
				throw new ConflictException('중복된 닉네임');
			}
		}
        for (let [key, value] of Object.entries(body)) {
			switch (key) {
				case 'nickname':
					if (result.length == 0 || result[0]['id'] != id)
						await this.mypageRepository.updateNickname(id, value);
					break;
				case 'avatar':
					await this.mypageRepository.updateAvatar(id, value);
					break;
				case 'twofactor_status':
					await this.mypageRepository.updateTwofactor(id, value);
					break;
				default:
					this.logger.error(`[${this.updateMypageInfo.name}] Bad Request DTO에 맞지 않는 body`)
					throw new BadRequestException('잘못된 요청');
					break;
			}
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
