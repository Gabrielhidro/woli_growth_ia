import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { healthRoutes } from './routes/health.routes';
import { chatRoutes } from './routes/chat.routes';
import { authRoutes } from './routes/auth.routes';
import { leadsRoutes } from './routes/leads.routes';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(env.FRONTEND_URL ? [env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (Postman, Railway health checks)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado para: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

app.use(healthRoutes);
app.use(chatRoutes);
app.use(authRoutes);
app.use(leadsRoutes);

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📋 Health check: http://localhost:${env.PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${env.PORT}/api/chat`);
  console.log(`📊 Leads API: http://localhost:${env.PORT}/api/leads`);
});
