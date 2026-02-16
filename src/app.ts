import express from 'express';
import cors from 'cors';
import pokemonRouter from '@/routes/pokemon';
import { errorHandler } from '@/utils/errorHandler';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use('/api/pokemon', pokemonRouter);

  // error handler at the end
  app.use(errorHandler);

  return app;
}
