import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const PORT = process.env.PORT ?? 3000;

async function start() {
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
