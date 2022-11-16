import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class MypageService {
  errorHandler(error, res: Response, logger: Logger, functionName: string) {
    if (error == 400) {
      logger.error(`${functionName}() Bad request return ${error}`);
      res.status(error).send();
    } else if (error == 404) {
      logger.error(`${functionName}() Not found return ${error}`);
      res.status(error).send();
    } else if (error == 500) {
      logger.error(`${functionName}() Database server error return ${error}`);
      res.status(error).send();
    } else {
      logger.error(`${functionName}() Undefiend error: ${error}`);
      res.status(500).send();
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
