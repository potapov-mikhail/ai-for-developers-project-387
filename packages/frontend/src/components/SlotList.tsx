import type { Slot } from '@/types';
import { cn } from '@/lib/utils';

interface SlotListProps {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot) => void;
  onBack: () => void;
  onContinue: () => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
}

export default function SlotList({
  slots,
  selectedSlot,
  onSelectSlot,
  onBack,
  onContinue,
}: SlotListProps) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Статус слотов</h3>
      <div className="max-h-[400px] space-y-2 overflow-y-auto">
        {slots.map((slot) => {
          const isSelected =
            selectedSlot?.startAt === slot.startAt && selectedSlot?.endAt === slot.endAt;
          return (
            <button
              key={slot.startAt}
              onClick={() => onSelectSlot(slot)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-colors',
                isSelected ? 'border-orange-500 bg-orange-50 font-medium' : 'hover:bg-muted',
              )}
            >
              <span>
                {formatTime(slot.startAt)} - {formatTime(slot.endAt)}
              </span>
              <span className="text-muted-foreground">Свободно</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Назад
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedSlot}
          className={cn(
            'flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
            selectedSlot ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-300 cursor-not-allowed',
          )}
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}
