import { db } from './index.js';
import { availability, eventTypes } from './schema.js';
import { count } from 'drizzle-orm';

export async function seed() {
  const [avRow] = db.select({ count: count() }).from(availability).all();
  if (avRow.count === 0) {
    const days = [
      { dayOfWeek: 0 },
      { dayOfWeek: 1 },
      { dayOfWeek: 2 },
      { dayOfWeek: 3 },
      { dayOfWeek: 4 },
      { dayOfWeek: 5 },
      { dayOfWeek: 6 },
    ];

    for (const day of days) {
      db.insert(availability)
        .values({
          id: crypto.randomUUID(),
          dayOfWeek: day.dayOfWeek,
          startTime: '09:00',
          endTime: '18:00',
        })
        .run();
    }

    console.log('Seeded 7 availability rows (09:00–18:00 daily).');
  } else {
    console.log('Availability already seeded, skipping.');
  }

  const [etRow] = db.select({ count: count() }).from(eventTypes).all();
  if (etRow.count === 0) {
    db.insert(eventTypes)
      .values({
        id: crypto.randomUUID(),
        name: 'Звонок 30 минут',
        description: 'Быстрый звонок для обсуждения вопросов',
        durationMinutes: 30,
        createdAt: new Date().toISOString(),
      })
      .run();
    console.log('Seeded default event type.');
  } else {
    console.log('Event types already seeded, skipping.');
  }
}

// Run directly
const isMain = process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js');
if (isMain) {
  seed();
}
