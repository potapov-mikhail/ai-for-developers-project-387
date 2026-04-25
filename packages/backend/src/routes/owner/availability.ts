import { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import { availability } from '../../db/schema.js';
import { eq, asc } from 'drizzle-orm';

const availabilityRoutes: FastifyPluginAsync = async (app) => {
  app.get('/availability', async () => {
    return db.select().from(availability).orderBy(asc(availability.dayOfWeek)).all();
  });

  app.put<{
    Body: { dayOfWeek: number; startTime: string; endTime: string };
  }>('/availability', async (request, reply) => {
    const { dayOfWeek, startTime, endTime } = request.body;

    const existing = db
      .select()
      .from(availability)
      .where(eq(availability.dayOfWeek, dayOfWeek))
      .get();

    if (!existing) {
      return reply.code(404).send({ message: 'Availability not found for this day' });
    }

    db.update(availability)
      .set({ startTime, endTime })
      .where(eq(availability.dayOfWeek, dayOfWeek))
      .run();

    return db.select().from(availability).where(eq(availability.dayOfWeek, dayOfWeek)).get();
  });
};

export default availabilityRoutes;
