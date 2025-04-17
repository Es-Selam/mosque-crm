const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Force load the test environment
const envTestPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(envTestPath)) {
  console.log(`Setting up E2E tests with environment from ${envTestPath}`);
  const envConfig = dotenv.parse(fs.readFileSync(envTestPath));

  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
}

// Validate essential environment variables
const requiredVars = ['TEST_DB_HOST', 'TEST_DB_PORT', 'TEST_DB_USERNAME', 'TEST_DB_PASSWORD'];
const missing = requiredVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Check your .env.test file or environment setup.');
  process.exit(1);
}

console.log('E2E test environment is set up with:', {
  TEST_DB_HOST: process.env.TEST_DB_HOST,
  TEST_DB_PORT: process.env.TEST_DB_PORT,
  TEST_DB_DATABASE: process.env.TEST_DB_DATABASE,
});