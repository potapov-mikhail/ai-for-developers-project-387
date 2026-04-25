import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import availabilityRoutes from './routes/owner/availability.js';
import ownerBookingsRoutes from './routes/owner/bookings.js';
import ownerEventTypesRoutes from './routes/owner/event-types.js';
import publicEventTypesRoutes from './routes/public/event-types.js';
import publicSlotsRoutes from './routes/public/slots.js';
import publicBookingsRoutes from './routes/public/bookings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = Fastify({ logger: true });

await app.register(cors);

// Owner routes
await app.register(availabilityRoutes, { prefix: '/api/v1/owner' });
await app.register(ownerBookingsRoutes, { prefix: '/api/v1/owner' });
await app.register(ownerEventTypesRoutes, { prefix: '/api/v1/owner' });

// Public routes
await app.register(publicEventTypesRoutes, { prefix: '/api/v1/public' });
await app.register(publicSlotsRoutes, { prefix: '/api/v1/public' });
await app.register(publicBookingsRoutes, { prefix: '/api/v1/public' });

// In production, serve frontend static files
if (process.env.NODE_ENV === 'production') {
  const fastifyStatic = await import('@fastify/static');
  await app.register(fastifyStatic.default, {
    root: path.join(__dirname, '../../frontend/dist'),
    wildcard: false,
  });

  // SPA fallback: serve index.html for non-API routes
  app.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith('/api')) {
      return reply.status(404).send({ error: 'Not found' });
    }
    return reply.sendFile('index.html');
  });
}

const port = Number(process.env.PORT) || 3000;

try {
  await app.listen({ port, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
