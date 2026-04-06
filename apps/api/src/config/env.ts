import dotenv from 'dotenv';
import path from 'path';

// Load .env from root of monorepo
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const env = {
  PORT: process.env.PORT || 3333,
  WOLI_AI_API_URL: process.env.WOLI_AI_API_URL || 'https://api-ia.woli.com.br',
  WOLI_AI_TOKEN: process.env.WOLI_AI_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cG4iOiIyMzAiLCJuYW1laWQiOiIyMzAiLCJ1bmlxdWVfbmFtZSI6IjIzMCIsIlVIIjoiMSIsIklBIjoiMjMwIiwiSVBBIjoiMjMwIiwiSUNBIjoiMiIsIklVQSI6IjE5NSIsIkRBIjoiMzE0MyIsInJvbGUiOlsiU0lTXzUiLCJTSVNfMzEiLCJTSVNfOTgiLCJTSVNfODciLCJTSVNfMTEiLCJTSVNfOTMiLCJTSVNfOTciLCJTSVNfNDMiLCJTSVNfODgiLCJTSVNfMzQiLCJTSVNfOTkiLCJTSVNfNzYiLCJTSVNfMjkiLCJTSVNfNzIiLCJTSVNfMzkiLCJTSVNfMSIsIlNJU181NyIsIlNJU18yMiIsIlNJU185MiIsIlNJU18yNSIsIlNJU183NyIsIlNJU184NSIsIlNJU184MyIsIlNJU182NiIsIlNJU18xIl0sIkZVVCI6IjEiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0LyIsImF1ZCI6IkFueSIsImV4cCI6MTc3NTUzMDgwMCwibmJmIjoxNzc1NDk2NDk1fQ.JrXIjAsreKhOITozmFMxRE81M4at-I14MpFgCz8eQ2M',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
