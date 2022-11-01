import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DatabaseService } from './database.service';
import { OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

const databasePoolFactory = async (configService: ConfigService) => {
  return new Pool({
    user: configService.get<string>('database.postgres_user'),
    host: configService.get<string>('database.postgres_host'),
    database: configService.get<string>('database.postgres_db_name'),
    password: configService.get<string>('database.postgres_password'),
    port: configService.get<number>('database.postgres_port'),
  });
};

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE_POOL',
      inject: [ConfigService],
      useFactory: databasePoolFactory,
    },
    DatabaseService,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule implements OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly moduleRef: ModuleRef) {}

  onApplicationShutdown(signal?: string): any {
    this.logger.log(`Shutting down on signal ${signal}`);
    const pool = this.moduleRef.get('DATABASE_POOL') as Pool;
    return pool.end();
  }
}
