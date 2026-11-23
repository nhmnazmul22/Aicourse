import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const PORT = env.PORT;

async function start() {
  await connectDB();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
