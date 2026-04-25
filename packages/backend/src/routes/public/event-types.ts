import { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import { eventTypes } from '../../db/schema.js';

const publicEventTypesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/event-types', async () => {
    return db.select().from(eventTypes).all();
  });
};

export default publicEventTypesRoutes;
