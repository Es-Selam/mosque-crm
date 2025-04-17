import { databaseConfig } from './database.config';
import { authConfig } from './auth.config';
import { appConfig } from './app.config';

export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  database: databaseConfig(),
  auth: authConfig(),
  app: appConfig(),
});