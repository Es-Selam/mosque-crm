// test/config/test-database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432', 10),
  username: process.env.TEST_DB_USERNAME || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'postgres',
  database: process.env.TEST_DB_DATABASE || 'mosque_crm_test',
  entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
  synchronize: true, // Only for testing
  dropSchema: true, // Clean state for each test suite
};