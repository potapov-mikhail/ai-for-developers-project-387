import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/api/client';
import type { Booking } from '@/types';

function formatSlotDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export default function EventsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getOwnerBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Предстоящие события</h1>

      {loading && <p className="text-sm text-muted-foreground">Загрузка...</p>}

      {!loading && bookings.length === 0 && (
        <p className="text-sm text-muted-foreground">Нет предстоящих событий.</p>
      )}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="space-y-1">
              <p className="font-semibold">{booking.guestName}</p>
              <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
              <p className="text-sm text-muted-foreground">
                Слот: {formatSlotDate(booking.startAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                Создано: {formatSlotDate(booking.createdAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
