import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { healthRoutes } from './routes/health.routes';
import { chatRoutes } from './routes/chat.routes';
import { authRoutes } from './routes/auth.routes';
import { leadsRoutes } from './routes/leads.routes';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

app.use(healthRoutes);
app.use(chatRoutes);
app.use(authRoutes);
app.use(leadsRoutes);

app.listen(Number(env.PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📋 Health check: http://localhost:${env.PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${env.PORT}/api/chat`);
  console.log(`📊 Leads API: http://localhost:${env.PORT}/api/leads`);
});
