import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import expenseRoutes from './routes/expense.routes.js';
import { notFound, errorHandler, HttpError } from './middleware/errorHandler.js';

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (env.corsOrigins.length === 0 || !origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new HttpError(403, `Origen no permitido por CORS: ${origin}`));
    },
  })
);
app.use(express.json({ limit: '100kb' }));

app.get('/', (_req, res) => {
  res.json({ name: 'Cuentas Claras API', docs: '/api/health', resources: ['/api/expenses'] });
});

app.get('/api/health', (_req, res) => {
  const dbStates = ['desconectada', 'conectada', 'conectando', 'desconectando'];
  res.json({
    status: 'ok',
    database: dbStates[mongoose.connection.readyState] ?? 'desconocido',
    uptime: Math.round(process.uptime()),
  });
});

app.use('/api/expenses', expenseRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
