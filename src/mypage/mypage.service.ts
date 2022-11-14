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
}
