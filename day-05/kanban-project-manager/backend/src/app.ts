import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';

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
  app.use(express.json());

  app.get('/api/hello', (_req, res) => {
    res.json({ message: 'hello world' });
  });

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

  return app;
}
