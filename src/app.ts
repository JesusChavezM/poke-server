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
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com; connect-src 'self' https://oauth2.googleapis.com https://poke-server-lake.vercel.app; img-src 'self' data: https://raw.githubusercontent.com; style-src 'self' 'unsafe-inline'; frame-src https://accounts.google.com; frame-ancestors 'self';"
    );
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
