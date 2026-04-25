import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const eventTypes = sqliteTable('event_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  createdAt: text('created_at').notNull(),
});

export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  eventTypeId: text('event_type_id')
    .notNull()
    .references(() => eventTypes.id),
  eventTypeName: text('event_type_name').notNull(),
  startAt: text('start_at').notNull(),
  endAt: text('end_at').notNull(),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  createdAt: text('created_at').notNull(),
});

export const availability = sqliteTable('availability', {
  id: text('id').primaryKey(),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
});
