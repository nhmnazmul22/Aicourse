import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import columnRoutes from './routes/columns';
import cardRoutes from './routes/cards';
import moveRoutes from './routes/move';
import { errorMiddleware, notFoundHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';

export function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "script-src": ["'self'", "'unsafe-inline'"],
        },
      },
    })
  );
  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());

  app.get('/api/hello', (_req, res) => {
    res.json({ message: 'hello world' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', authMiddleware, projectRoutes);
  app.use('/api/projects/:id/columns', authMiddleware, columnRoutes);
  app.use('/api/projects/:id/columns/:columnId/cards', authMiddleware, cardRoutes);
  app.use('/api/projects/:id/cards', authMiddleware, moveRoutes);

  const frontendOut = path.join(__dirname, 'frontend/out');
  const fallbackOut = path.join(__dirname, '../../frontend/out');
  const outDir = fs.existsSync(frontendOut) ? frontendOut : fallbackOut;

  if (fs.existsSync(outDir)) {
    app.use(express.static(outDir));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(outDir, 'index.html'));
    });
  } else {
    app.get('/', (_req, res) => {
      res.send('<html><body><h1>hello world</h1></body></html>');
    });
  }

  app.use(notFoundHandler);
  app.use(errorMiddleware);

  return app;
}
