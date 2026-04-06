import dotenv from 'dotenv';
import path from 'path';

// Load .env from root of monorepo
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const env = {
  PORT: process.env.PORT || 3333,
  WOLI_AI_API_URL: process.env.WOLI_AI_API_URL || 'https://api-ia.woli.com.br',
  WOLI_AI_TOKEN: process.env.WOLI_AI_TOKEN || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || '',
} as const;
