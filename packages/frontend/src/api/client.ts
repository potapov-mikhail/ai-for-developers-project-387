import type { Booking, CreateBookingRequest, EventType, Slot } from '../types';

const BASE = '/api/v1';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getPublicEventTypes() {
    return fetchJson<EventType[]>(`${BASE}/public/event-types`);
  },

  getSlots(eventTypeId: string, date: string) {
    return fetchJson<Slot[]>(`${BASE}/public/event-types/${eventTypeId}/slots?date=${date}`);
  },

  createBooking(body: CreateBookingRequest) {
    return fetchJson<Booking>(`${BASE}/public/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  getOwnerBookings() {
    return fetchJson<Booking[]>(`${BASE}/owner/bookings`);
  },
};
