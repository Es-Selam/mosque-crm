const { Client } = require('pg');

async function setupTestDatabase() {
  // Connect to default postgres database to create test database
  const client = new Client({
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5432,
    user: process.env.TEST_DB_USERNAME || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    database: 'postgres',
  });

  try {
    await client.connect();

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