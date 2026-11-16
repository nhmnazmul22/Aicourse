import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.send('<html><body><h1>hello world</h1></body></html>');
  });

  app.get('/api/hello', (_req, res) => {
    res.json({ message: 'hello world' });
  });

  return app;
}
