import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Calendar from '@/components/Calendar';
import SlotList from '@/components/SlotList';
import BookingInfo from '@/components/BookingInfo';
import BookingForm from '@/components/BookingForm';
import { api } from '@/api/client';
import type { EventType, Slot } from '@/types';

type Step = 'select' | 'confirm' | 'success';

export default function BookingPage() {
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [step, setStep] = useState<Step>('select');

  // Calendar state
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Slots
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Load first event type
  useEffect(() => {
    api.getPublicEventTypes().then((types) => {
      if (types.length > 0) setEventType(types[0]);
    });
  }, []);

  // Load slots when date is selected
  useEffect(() => {
    if (!selectedDate || !eventType) {
      return;
    }
    setLoadingSlots(true);
    setSelectedSlot(null);
    api
      .getSlots(eventType.id, selectedDate)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, eventType]);

  const handlePrevMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, [setYear]);

  const handleNextMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, [setYear]);

  const handleBookingSuccess = useCallback(() => {
    setStep('success');
  }, []);

  const handleReset = useCallback(() => {
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
    setStep('select');
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Запись на звонок</h1>

      {step === 'select' && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px]">
          <Card>
            <CardContent>
              <BookingInfo
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                freeSlots={slots.length}
                eventType={eventType}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Calendar
                year={year}
                month={month}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              {!selectedDate ? (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Статус слотов</h3>
                  <p className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    Выберите дату в календаре.
                  </p>
                </div>
              ) : loadingSlots ? (
                <p className="text-sm text-muted-foreground">Загрузка...</p>
              ) : (
                <SlotList
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  onBack={() => setSelectedDate(null)}
                  onContinue={() => setStep('confirm')}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'confirm' && eventType && selectedSlot && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent>
              <BookingInfo
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                freeSlots={slots.length}
                eventType={eventType}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <BookingForm
                eventTypeId={eventType.id}
                slot={selectedSlot}
                onSuccess={handleBookingSuccess}
                onBack={() => setStep('select')}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'success' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent>
              <BookingInfo
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                freeSlots={slots.length - 1}
                eventType={eventType}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-6 py-12">
              <h2 className="text-xl font-bold">Бронь подтверждена. До встречи!</h2>
              <button
                onClick={handleReset}
                className="w-full rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white hover:bg-orange-600"
              >
                Забронировать еще
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
