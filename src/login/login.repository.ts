import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class LoginRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(id: string, nickname: string, avatar: File) {
    const databaseResponse = await this.databaseService.runQuery(
      `
		INSERT INTO user (id, nickname, avatar)
		VALUES ($1, $2, $3);
		`,
      [id, nickname, avatar],
    );
  }
}
