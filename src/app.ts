import express from 'express';
import cors from 'cors';
import pokemonRouter from './routes/pokemon';
import authRouter from './routes/auth';
import { errorHandler } from './utils/errorHandler';
import { FRONTEND_ORIGIN } from './config';

export function createApp() {
  const app = express();

  if (!FRONTEND_ORIGIN) console.warn('FRONTEND_ORIGIN no definido — revisa .env o config');

  const allowedOrigins = [FRONTEND_ORIGIN, 'http://localhost:9000'].filter(Boolean);
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
  });
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
          return callback(null, true);
        }
        return callback(new Error('CORS: origin not allowed'), false);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/pokemon', pokemonRouter);
  app.use(errorHandler);

  return app;
}
