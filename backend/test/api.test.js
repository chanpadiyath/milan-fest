import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { openDatabase } from '../src/db/database.js';
import { seedIfEmpty } from '../src/db/seed.js';
import { createApp } from '../src/app.js';

const ADMIN_KEY = 'test-admin-key';
const FIXED_NOW = new Date('2027-01-01T00:00:00.000Z');

const validEvent = {
  title: 'Test Event',
  description: 'A sample event used only by the test suite.',
  category: 'Music',
  venue: 'Test Hall',
  startTime: '2027-03-18T18:00:00+05:30',
  capacity: 2,
};

const person = (n) => ({ name: `Participant ${n}`, email: `p${n}@example.com`, college: 'Sample College' });

let app;
beforeEach(() => {
  const db = openDatabase(':memory:');
  seedIfEmpty(db);
  app = createApp(db, { adminApiKey: ADMIN_KEY, now: () => FIXED_NOW });
});

const createEvent = (body = validEvent) =>
  request(app).post('/api/events').set('X-Admin-Key', ADMIN_KEY).send(body);

describe('GET /api/events', () => {
  test('lists seeded events sorted by start time', async () => {
    const res = await request(app).get('/api/events').expect(200);
    assert.equal(res.body.meta.count, 10);
    const times = res.body.data.map((e) => e.startTime);
    assert.deepEqual(times, [...times].sort());
    assert.ok(res.body.data.every((e) => e.seatsLeft === e.capacity));
  });

  test('filters by category, case-insensitively', async () => {
    const res = await request(app).get('/api/events?category=dance').expect(200);
    assert.equal(res.body.meta.count, 2);
    assert.ok(res.body.data.every((e) => e.category === 'Dance'));
  });

  test('searches title, description and venue', async () => {
    const res = await request(app).get('/api/events?q=robo').expect(200);
    assert.deepEqual(res.body.data.map((e) => e.title), ['RoboRace']);
  });

  test('rejects an unknown category with 400', async () => {
    const res = await request(app).get('/api/events?category=Cooking').expect(400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });
});

describe('GET /api/events/:id', () => {
  test('returns one event', async () => {
    const res = await request(app).get('/api/events/1').expect(200);
    assert.equal(res.body.data.id, 1);
  });

  test('returns 404 for a missing or malformed id', async () => {
    await request(app).get('/api/events/9999').expect(404);
    const res = await request(app).get('/api/events/abc').expect(404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });
});

describe('POST /api/events (admin)', () => {
  test('creates an event and normalises start time to UTC', async () => {
    const res = await createEvent().expect(201);
    assert.equal(res.headers.location, `/api/events/${res.body.data.id}`);
    assert.equal(res.body.data.startTime, '2027-03-18T12:30:00.000Z');
    assert.equal(res.body.data.seatsLeft, 2);
  });

  test('requires the admin key', async () => {
    await request(app).post('/api/events').send(validEvent).expect(401);
    await request(app).post('/api/events').set('X-Admin-Key', 'wrong').send(validEvent).expect(401);
  });

  test('reports every invalid field at once', async () => {
    const res = await createEvent({ title: 'x', category: 'Cooking', capacity: 0 }).expect(400);
    const fields = res.body.error.details.map((d) => d.field).sort();
    assert.deepEqual(fields, ['capacity', 'category', 'description', 'startTime', 'title', 'venue']);
  });

  test('rejects malformed JSON', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('X-Admin-Key', ADMIN_KEY)
      .set('Content-Type', 'application/json')
      .send('{"title":')
      .expect(400);
    assert.equal(res.body.error.code, 'INVALID_JSON');
  });
});

describe('POST /api/events/:id/registrations', () => {
  test('registers a participant and updates seats left', async () => {
    const { body } = await createEvent();
    const id = body.data.id;
    const res = await request(app).post(`/api/events/${id}/registrations`).send(person(1)).expect(201);
    assert.equal(res.body.data.eventId, id);
    const event = await request(app).get(`/api/events/${id}`);
    assert.equal(event.body.data.seatsLeft, 1);
  });

  test('blocks duplicate registration, ignoring email case', async () => {
    const { body } = await createEvent();
    const url = `/api/events/${body.data.id}/registrations`;
    await request(app).post(url).send(person(1)).expect(201);
    const res = await request(app).post(url).send({ ...person(1), email: 'P1@Example.com' }).expect(409);
    assert.equal(res.body.error.code, 'ALREADY_REGISTERED');
  });

  test('blocks registration once capacity is reached', async () => {
    const { body } = await createEvent();
    const url = `/api/events/${body.data.id}/registrations`;
    await request(app).post(url).send(person(1)).expect(201);
    await request(app).post(url).send(person(2)).expect(201);
    const res = await request(app).post(url).send(person(3)).expect(409);
    assert.equal(res.body.error.code, 'EVENT_FULL');
  });

  test('blocks registration for an event that has started', async () => {
    const { body } = await createEvent({ ...validEvent, startTime: '2026-12-01T10:00:00Z' });
    const res = await request(app).post(`/api/events/${body.data.id}/registrations`).send(person(1)).expect(409);
    assert.equal(res.body.error.code, 'REGISTRATION_CLOSED');
  });

  test('validates participant fields', async () => {
    const res = await request(app)
      .post('/api/events/1/registrations')
      .send({ name: 'A', email: 'not-an-email', phone: '12' })
      .expect(400);
    const fields = res.body.error.details.map((d) => d.field).sort();
    assert.deepEqual(fields, ['college', 'email', 'name', 'phone']);
  });

  test('returns 404 for an unknown event', async () => {
    await request(app).post('/api/events/9999/registrations').send(person(1)).expect(404);
  });
});

describe('GET /api/events/:id/registrations (admin)', () => {
  test('lists registrations only with the admin key', async () => {
    await request(app).post('/api/events/1/registrations').send(person(1)).expect(201);
    await request(app).get('/api/events/1/registrations').expect(401);
    const res = await request(app).get('/api/events/1/registrations').set('X-Admin-Key', ADMIN_KEY).expect(200);
    assert.equal(res.body.meta.count, 1);
  });
});

test('unknown routes return a JSON 404', async () => {
  const res = await request(app).get('/api/nope').expect(404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});
