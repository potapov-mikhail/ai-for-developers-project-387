import { cn } from '@/lib/utils';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface CalendarProps {
  year: number;
  month: number;
  selectedDate: string | null;
  slotCounts?: Record<string, number>;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function getMonthName(month: number) {
  const names = [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
  ];
  return names[month];
}

export default function Calendar({
  year,
  month,
  selectedDate,
  slotCounts,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarProps) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Previous month fill
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: { day: number; month: number; year: number; current: boolean }[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    cells.push({ day: d, month: m, year: y, current: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, current: true });
  }

  // Next month fill
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      cells.push({ day: d, month: m, year: y, current: false });
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Календарь</h3>
        <div className="flex gap-1">
          <button
            onClick={onPrevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-md border text-sm hover:bg-muted"
          >
            &larr;
          </button>
          <button
            onClick={onNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-md border text-sm hover:bg-muted"
          >
            &rarr;
          </button>
        </div>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        {getMonthName(month)} {year} г.
      </p>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="py-1 text-center text-xs font-medium text-muted-foreground">
            {wd}
          </div>
        ))}
        {cells.map((cell, i) => {
          const dateStr = formatDate(cell.year, cell.month, cell.day);
          const isSelected = dateStr === selectedDate;
          const count = slotCounts?.[dateStr];
          const today = new Date();
          const cellDate = new Date(cell.year, cell.month, cell.day);
          const isPast =
            cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <button
              key={i}
              onClick={() => !isPast && cell.current && onSelectDate(dateStr)}
              disabled={isPast || !cell.current}
              className={cn(
                'flex flex-col items-center justify-center rounded-md py-1.5 text-sm transition-colors',
                !cell.current && 'text-muted-foreground/40',
                cell.current && !isPast && 'hover:bg-muted cursor-pointer',
                isPast && 'text-muted-foreground/40',
                isSelected &&
                  'border-2 border-orange-500 bg-orange-50 font-semibold text-orange-700',
              )}
            >
              <span>{cell.day}</span>
              {count !== undefined && count > 0 && (
                <span className="text-[10px] text-muted-foreground">{count} св.</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
