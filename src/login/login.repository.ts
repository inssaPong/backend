import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class LoginRepository {
  constructor(private readonly databaseService: DatabaseService) {}
  async createUser(id: string, nickname: string, email: string) {
    const databaseResponse = await this.databaseService.runQuery(
      `
		INSERT INTO "user" (id, nickname, email)
		VALUES ($1, $2, $3);
		`,
      [id, nickname, email],
    );
  }
}
