import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Force load .env.test file with priority
const envTestPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(envTestPath)) {
  console.log(`Loading environment from ${envTestPath}`);
  const envConfig = dotenv.parse(fs.readFileSync(envTestPath));

  // Explicitly set environment variables
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
}

// Log configuration for debugging
console.log('Database test configuration:', {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: process.env.TEST_DB_PORT || '30000',
  database: process.env.TEST_DB_DATABASE || 'mosque_crm_test',
});

export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '30000', 10),
  username: process.env.TEST_DB_USERNAME || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'postgres',
  database: process.env.TEST_DB_DATABASE || 'mosque_crm_test',
  entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
  synchronize: true,
  dropSchema: true,
  logging: true, // Enable logging during tests for debugging
};