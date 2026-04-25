import { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import { eventTypes, bookings, availability } from '../../db/schema.js';
import { eq, and, gte, lt } from 'drizzle-orm';
import { computeAvailableSlots, jsDayToSpecDay } from '../../services/slots.js';

const publicSlotsRoutes: FastifyPluginAsync = async (app) => {
  app.get<{
    Params: { eventTypeId: string };
    Querystring: { date: string };
  }>('/event-types/:eventTypeId/slots', async (request, reply) => {
    const { eventTypeId } = request.params;
    const { date } = request.query;

    const eventType = db.select().from(eventTypes).where(eq(eventTypes.id, eventTypeId)).get();

    if (!eventType) {
      return reply.code(404).send({ message: 'Event type not found' });
    }

    const jsDay = new Date(`${date}T00:00:00Z`).getUTCDay();
    const specDay = jsDayToSpecDay(jsDay);

    const dayAvailability = db
      .select()
      .from(availability)
      .where(eq(availability.dayOfWeek, specDay))
      .get();

    if (!dayAvailability) {
      return [];
    }

    // Get all bookings for this date (across all event types)
    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;

    const dayBookings = db
      .select()
      .from(bookings)
      .where(and(gte(bookings.startAt, dayStart), lt(bookings.startAt, dayEnd)))
      .all();

    return computeAvailableSlots(date, dayAvailability, eventType.durationMinutes, dayBookings);
  });
};

export default publicSlotsRoutes;
