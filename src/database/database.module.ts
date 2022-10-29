import { Global, Module } from '@nestjs/common';
import {
  ConfigurableDatabaseModule,
  CONNECTION_POOL,
} from './database.module-definition';
import { Pool } from 'pg';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  exports: [DatabaseService],
  providers: [
    DatabaseService,
    {
      provide: CONNECTION_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Pool({
          host: configService.get('POSTGRES_HOST'),
          port: configService.get('POSTGRES_PORT'),
          user: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          database: configService.get('POSTGRES_DB_NAME'),
        });
      },
    },
  ],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
