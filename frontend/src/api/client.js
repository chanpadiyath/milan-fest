// Single data layer for the app. If VITE_API_URL is set, every call goes to
// the Milan API. If not, the same functions run against the bundled sample
// data, with registrations kept in this browser's localStorage, so the site
// still works as a standalone demo.

import localEvents from '../data/events.json';

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
export const usingApi = Boolean(API_URL);

export class ApiError extends Error {
  constructor(code, message, { status, details } = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function http(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new ApiError('NETWORK', 'We could not reach the server. Check your connection and try again.');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = body?.error ?? {};
    throw new ApiError(err.code ?? `HTTP_${res.status}`, err.message ?? 'Something went wrong. Please try again.', {
      status: res.status,
      details: err.details,
    });
  }
  return body.data;
}

// ---- Local fallback -------------------------------------------------------

const STORE_KEY = 'milan.registrations';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function withSeats(event) {
  const registeredCount = (readStore()[event.id] ?? []).length;
  return { ...event, registeredCount, seatsLeft: Math.max(event.capacity - registeredCount, 0) };
}

const local = {
  async listEvents() {
    await delay(250);
    return [...localEvents].sort((a, b) => a.startTime.localeCompare(b.startTime)).map(withSeats);
  },
  async getEvent(id) {
    await delay(150);
    const event = localEvents.find((e) => e.id === Number(id));
    if (!event) throw new ApiError('NOT_FOUND', `Event ${id} does not exist.`, { status: 404 });
    return withSeats(event);
  },
  async register(id, participant) {
    await delay(400);
    const event = await local.getEvent(id);
    const store = readStore();
    const emails = store[event.id] ?? [];
    const email = participant.email.trim().toLowerCase();
    if (new Date(event.startTime) <= new Date()) {
      throw new ApiError('REGISTRATION_CLOSED', 'Registration has closed: this event has already started.', { status: 409 });
    }
    if (emails.includes(email)) {
      throw new ApiError('ALREADY_REGISTERED', 'This email is already registered for this event.', { status: 409 });
    }
    if (event.seatsLeft === 0) throw new ApiError('EVENT_FULL', 'This event is full. No seats are left.', { status: 409 });
    store[event.id] = [...emails, email];
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return { id: Date.now(), eventId: event.id, ...participant, email, createdAt: new Date().toISOString() };
  },
};

// ---- Public API -----------------------------------------------------------

export const listEvents = () => (usingApi ? http('/api/events') : local.listEvents());

export const getEvent = (id) => (usingApi ? http(`/api/events/${encodeURIComponent(id)}`) : local.getEvent(id));

export const registerForEvent = (id, participant) =>
  usingApi
    ? http(`/api/events/${encodeURIComponent(id)}/registrations`, { method: 'POST', body: JSON.stringify(participant) })
    : local.register(id, participant);
