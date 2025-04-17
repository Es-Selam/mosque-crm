import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    const port = this.configService.get<number>('port');
    const dbConfig = this.configService.get('database');

    return `Hello World! Running on port ${port} with database ${dbConfig.database}`;
  }
}
