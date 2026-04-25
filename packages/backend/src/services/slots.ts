interface AvailabilityWindow {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

interface BookingRecord {
  startAt: string; // ISO 8601
  endAt: string; // ISO 8601
}

interface Slot {
  startAt: string;
  endAt: string;
}

export function computeAvailableSlots(
  date: string, // YYYY-MM-DD
  avail: AvailabilityWindow,
  durationMinutes: number,
  existingBookings: BookingRecord[],
): Slot[] {
  const windowStart = new Date(`${date}T${avail.startTime}:00Z`);
  const windowEnd = new Date(`${date}T${avail.endTime}:00Z`);

  const slots: Slot[] = [];
  let current = windowStart.getTime();
  const durationMs = durationMinutes * 60 * 1000;

  while (current + durationMs <= windowEnd.getTime()) {
    const candidateStart = current;
    const candidateEnd = current + durationMs;

    const hasConflict = existingBookings.some((b) => {
      const bStart = new Date(b.startAt).getTime();
      const bEnd = new Date(b.endAt).getTime();
      return candidateStart < bEnd && candidateEnd > bStart;
    });

    if (!hasConflict) {
      slots.push({
        startAt: new Date(candidateStart).toISOString(),
        endAt: new Date(candidateEnd).toISOString(),
      });
    }

    current += durationMs;
  }

  return slots;
}

/** Convert JS getDay() (0=Sun) to spec dayOfWeek (0=Mon) */
export function jsDayToSpecDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}
