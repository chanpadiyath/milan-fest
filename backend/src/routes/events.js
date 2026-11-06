import { Router } from 'express';
import { notFound } from '../errors.js';
import { parseId } from '../validation.js';

// HTTP layer only: read params, call the service, pick a status code.
export function eventRoutes(service, requireAdmin) {
  const router = Router();

  const eventId = (req) => {
    const id = parseId(req.params.id);
    if (!id) throw notFound(`Event ${req.params.id} does not exist.`);
    return id;
  };

  router.get('/categories', (_req, res) => {
    res.json({ data: service.categories() });
  });

  router.get('/events', (req, res) => {
    const events = service.listEvents({ category: req.query.category, q: req.query.q });
    res.json({ data: events, meta: { count: events.length } });
  });

  router.get('/events/:id', (req, res) => {
    res.json({ data: service.getEvent(eventId(req)) });
  });

  router.post('/events', requireAdmin, (req, res) => {
    const event = service.createEvent(req.body);
    res.status(201).location(`/api/events/${event.id}`).json({ data: event });
  });

  router.post('/events/:id/registrations', (req, res) => {
    const registration = service.register(eventId(req), req.body);
    res.status(201).json({ data: registration });
  });

  router.get('/events/:id/registrations', requireAdmin, (req, res) => {
    const registrations = service.listRegistrations(eventId(req));
    res.json({ data: registrations, meta: { count: registrations.length } });
  });

  return router;
}
