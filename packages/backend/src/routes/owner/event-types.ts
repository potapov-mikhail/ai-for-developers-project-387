import { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import { eventTypes } from '../../db/schema.js';

const ownerEventTypesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/event-types', async () => {
    return db.select().from(eventTypes).all();
  });

  app.post<{
    Body: { name: string; description: string; durationMinutes: number };
  }>('/event-types', async (request, reply) => {
    const { name, description, durationMinutes } = request.body;

    if (!name || !description || !durationMinutes || durationMinutes < 1) {
      return reply.code(400).send({ message: 'Invalid event type data' });
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    db.insert(eventTypes).values({ id, name, description, durationMinutes, createdAt: now }).run();

    return reply.code(201).send({
      id,
      name,
      description,
      durationMinutes,
      createdAt: now,
    });
  });
};

export default ownerEventTypesRoutes;
