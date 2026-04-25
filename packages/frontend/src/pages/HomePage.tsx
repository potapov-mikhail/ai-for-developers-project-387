import { Link } from 'react-router';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-16 py-16 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-lg space-y-6">
        <span className="inline-block rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
          БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК
        </span>
        <h1 className="text-5xl font-bold tracking-tight">Calendar</h1>
        <p className="text-lg text-muted-foreground">
          Один экран, понятные слоты, быстрая бронь. Выберите время и запишитесь на звонок без
          лишних шагов.
        </p>
        <Link
          to="/booking"
          className={buttonVariants({
            className: 'bg-orange-500 hover:bg-orange-600 text-white',
            size: 'lg',
          })}
        >
          Записаться &rarr;
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold">Что доступно прямо сейчас</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>&#8226; Фиксированные 30-минутные слоты с 09:00 до 18:00.</li>
            <li>&#8226; Проверка конфликта при бронировании.</li>
            <li>&#8226; Просмотр предстоящих событий в отдельном разделе.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
