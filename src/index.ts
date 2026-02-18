import { createApp } from './app';
import { connectDb } from './db';
import { PORT } from './config';

async function start() {
  await connectDb();

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
