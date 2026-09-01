// Mikyaj Full-Stack Server Entry Point
// Express + Vite + Transactional Booking Engine + Independent Notification Outbox
// Conforms to Mikyaj Engineering Specification Rev. 5 & SRS v2.1

import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiV1Router } from './server/routes';
import { notificationWorkers } from './server/notificationWorker';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON & Cookie Parsing
  app.use(express.json());
  app.use(cookieParser());

  // Mount Versioned API v1 Router FIRST (Section 11, DEC-036)
  app.use('/api/v1', apiV1Router);
  app.use('/api', apiV1Router);

  // Start background outbox workers for Email & WhatsApp (DEC-011, DEC-012, §14)
  notificationWorkers.startWorkers();

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mikyaj Portal Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
