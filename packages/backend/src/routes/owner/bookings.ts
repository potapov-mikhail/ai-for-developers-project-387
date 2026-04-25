import { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import { bookings } from '../../db/schema.js';
import { gte, asc } from 'drizzle-orm';

const ownerBookingsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/bookings', async () => {
    const now = new Date().toISOString();
    return db
      .select()
      .from(bookings)
      .where(gte(bookings.startAt, now))
      .orderBy(asc(bookings.startAt))
      .all();
  });
};

export default ownerBookingsRoutes;
