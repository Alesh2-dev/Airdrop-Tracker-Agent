import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import routes from './routes/index';
import { startReminderAgent } from './jobs/reminderAgent';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Start server
const bootstrap = async () => {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API ready at http://localhost:${PORT}/api`);
  });

  // Start background agent
  startReminderAgent();
};

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});