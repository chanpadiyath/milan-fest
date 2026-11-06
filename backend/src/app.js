import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ApiError } from './errors.js';
import { createRepository } from './db/repository.js';
import { createEventService } from './services/eventService.js';
import { adminAuth } from './middleware/adminAuth.js';
import { eventRoutes } from './routes/events.js';

// Builds the Express app around a database handle. Tests pass an in-memory
// database; server.js passes the real one.
export function createApp(db, { adminApiKey = '', corsOrigins = ['*'], now } = {}) {
  const service = createEventService(db, createRepository(db), { now });
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: corsOrigins.includes('*') ? '*' : corsOrigins }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/', (_req, res) => {
    res.json({ name: 'Milan API', docs: 'See README.md in the repository', health: '/api/health' });
  });
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', eventRoutes(service, adminAuth(adminApiKey)));

  app.use((req, _res, next) => {
    next(new ApiError(404, 'NOT_FOUND', `No route for ${req.method} ${req.path}.`));
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      err = new ApiError(400, 'INVALID_JSON', 'Request body is not valid JSON.');
    } else if (err.type === 'entity.too.large') {
      err = new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
    } else if (!(err instanceof ApiError)) {
      console.error(err);
      err = new ApiError(500, 'INTERNAL_ERROR', 'Something went wrong on the server.');
    }
    res.status(err.status).json({
      error: { code: err.code, message: err.message, ...(err.details && { details: err.details }) },
    });
  });

  return app;
}
