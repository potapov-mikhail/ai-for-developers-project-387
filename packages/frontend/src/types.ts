export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  eventTypeName: string;
  startAt: string;
  endAt: string;
  guestName: string;
  guestEmail: string;
  createdAt: string;
}

export interface Slot {
  startAt: string;
  endAt: string;
}

export interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface CreateBookingRequest {
  eventTypeId: string;
  startAt: string;
  guestName: string;
  guestEmail: string;
}
