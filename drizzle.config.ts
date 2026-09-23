import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema/*.ts',
  out: './db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'sippa',
  },
});
