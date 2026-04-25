import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { api } from '@/api/client';
import type { Slot } from '@/types';

interface BookingFormProps {
  eventTypeId: string;
  slot: Slot;
  onSuccess: () => void;
  onBack: () => void;
}

export default function BookingForm({ eventTypeId, slot, onSuccess, onBack }: BookingFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createBooking({
        eventTypeId,
        startAt: slot.startAt,
        guestName: name,
        guestEmail: email,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Подтверждение записи</h3>
        <button
          onClick={onBack}
          className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          Изменить
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {submitting ? 'Отправка...' : 'Подтвердить запись'}
        </button>
      </form>
    </div>
  );
}
