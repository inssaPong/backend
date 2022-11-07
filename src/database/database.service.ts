import { Injectable, Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  runQuery(queryText: string): Promise<any[]> {
    this.logger.debug(`Executing query: ${queryText}`);
    return this.pool.query(queryText).then((result: QueryResult) => {
      this.logger.debug(`Executed query, result size ${result.rows.length}`);
      return result.rows;
    });
  }
}
