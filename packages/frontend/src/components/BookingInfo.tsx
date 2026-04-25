import type { EventType, Slot } from '@/types';

interface BookingInfoProps {
  selectedDate: string | null;
  selectedSlot: Slot | null;
  freeSlots: number;
  eventType: EventType | null;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
}

function formatDateRu(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-blue-50/60 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default function BookingInfo({
  selectedDate,
  selectedSlot,
  freeSlots,
  eventType,
}: BookingInfoProps) {
  const timeStr = selectedSlot
    ? `${formatTime(selectedSlot.startAt)} - ${formatTime(selectedSlot.endAt)}`
    : 'Время не выбрано';

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Информация</h3>
      <div className="space-y-3">
        <InfoRow
          label="Выбранная дата"
          value={selectedDate ? formatDateRu(selectedDate) : 'Дата не выбрана'}
        />
        <InfoRow label="Выбранное время" value={timeStr} />
        <InfoRow label="Свободно" value={String(freeSlots)} />
        <InfoRow
          label="Длительности в дне"
          value={
            eventType && selectedDate
              ? `${eventType.durationMinutes} мин`
              : 'Нет слотов на этот день'
          }
        />
      </div>
    </div>
  );
}
