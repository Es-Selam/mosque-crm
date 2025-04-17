import { config } from 'dotenv';
import { join } from 'path';

// Load .env.test file
config({ path: join(process.cwd(), '.env.test') });

// Log database config for debugging
console.log('E2E Test Database Configuration:');
console.log({
  host: process.env.TEST_DB_HOST,
  port: process.env.TEST_DB_PORT,
  username: process.env.TEST_DB_USERNAME,
  database: process.env.TEST_DB_DATABASE,
});