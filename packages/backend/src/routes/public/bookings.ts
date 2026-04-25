import { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import { eventTypes, bookings } from '../../db/schema.js';
import { eq, and, lt, gt } from 'drizzle-orm';

const publicBookingsRoutes: FastifyPluginAsync = async (app) => {
  app.post<{
    Body: {
      eventTypeId: string;
      startAt: string;
      guestName: string;
      guestEmail: string;
    };
  }>('/bookings', async (request, reply) => {
    const { eventTypeId, startAt, guestName, guestEmail } = request.body;

    const eventType = db.select().from(eventTypes).where(eq(eventTypes.id, eventTypeId)).get();

    if (!eventType) {
      return reply.code(404).send({ message: 'Event type not found' });
    }

    const startDate = new Date(startAt);
    const endDate = new Date(startDate.getTime() + eventType.durationMinutes * 60 * 1000);
    const endAt = endDate.toISOString();

    // Check for overlapping bookings across ALL event types
    const conflicting = db
      .select()
      .from(bookings)
      .where(and(lt(bookings.startAt, endAt), gt(bookings.endAt, startAt)))
      .get();

    if (conflicting) {
      return reply.code(409).send({ message: 'Slot is already booked' });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.insert(bookings)
      .values({
        id,
        eventTypeId,
        eventTypeName: eventType.name,
        startAt: startDate.toISOString(),
        endAt,
        guestName,
        guestEmail,
        createdAt: now,
      })
      .run();

    return reply.code(201).send({
      id,
      eventTypeId,
      eventTypeName: eventType.name,
      startAt: startDate.toISOString(),
      endAt,
      guestName,
      guestEmail,
      createdAt: now,
    });
  });
};

export default publicBookingsRoutes;
