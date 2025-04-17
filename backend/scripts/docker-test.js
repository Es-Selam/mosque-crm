const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load test environment variables
const envTestPath = path.resolve(__dirname, '../.env.test');
const testEnv = dotenv.parse(fs.readFileSync(envTestPath));

console.log('Using test environment configuration:', testEnv);

// Helper to run a command with environment variables
async function runCommand(command, args, envVars) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      env: { ...process.env, ...envVars },
      stdio: 'inherit',
      shell: true
    });

    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function main() {
  try {
    // Start Docker with test env variables
    console.log('Starting Docker container for testing...');
    await runCommand('docker-compose', ['-f', 'docker-compose.test.yml', '--env-file', '.env.test', 'up', '-d'], testEnv);

    // Wait for PostgreSQL to be ready
    console.log('Waiting for PostgreSQL to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Run tests
    console.log('Running tests...');
    await runCommand('jest', ['--config', './test/jest-e2e.json', '--runInBand'], testEnv);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    // Clean up
    console.log('Stopping Docker container...');
    await runCommand('docker-compose', ['-f', 'docker-compose.test.yml', 'down'], {});
  }
}

main();