require('dotenv').config({ path: '.env.test' }); // Load test env variables
const { Client } = require('pg');

async function setupTestDatabase() {
  console.log('Setting up test database with the following configuration:');
  console.log({
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || '30000',
    user: process.env.TEST_DB_USERNAME || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default database first
  });

  // Connect to default postgres database to create test database
  const client = new Client({
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '30000', 10), // Default to 30000
    user: process.env.TEST_DB_USERNAME || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Successfully connected to PostgreSQL');

    // Check if test database exists
    const dbCheckResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'mosque_crm_test'"
    );

    // Create test database if it doesn't exist
    if (dbCheckResult.rows.length === 0) {
      console.log('Creating test database: mosque_crm_test');
      await client.query('CREATE DATABASE mosque_crm_test');
    } else {
      console.log('Test database already exists');
    }

    console.log('Test database setup completed');
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupTestDatabase();