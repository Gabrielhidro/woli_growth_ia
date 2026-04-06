import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { healthRoutes } from './routes/health.routes';
import { chatRoutes } from './routes/chat.routes';

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use(healthRoutes);
app.use(chatRoutes);

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📋 Health check: http://localhost:${env.PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${env.PORT}/api/chat`);
});
