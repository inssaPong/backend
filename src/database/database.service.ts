import { Injectable, Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  runQuery(queryText: string, param?: unknown[]) {
    return this.pool.query(queryText, param).then((result: QueryResult) => {
      return result.rows;
    });
  }
}
