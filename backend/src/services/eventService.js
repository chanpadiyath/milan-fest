// Business rules for events and registrations. Routes call these; these call
// the repository. Nothing in here knows about HTTP requests.

import { transaction } from '../db/database.js';
import { badRequest, conflict, notFound } from '../errors.js';
import { normaliseCategory, validateEvent, validateRegistration, CATEGORIES } from '../validation.js';

export function createEventService(db, repo, { now = () => new Date() } = {}) {
  function requireEvent(id) {
    const event = repo.getEvent(id);
    if (!event) throw notFound(`Event ${id} does not exist.`);
    return event;
  }

  return {
    listEvents({ category, q } = {}) {
      let cat = null;
      if (category !== undefined && category !== '') {
        cat = normaliseCategory(category);
        if (!cat) {
          throw badRequest(`Unknown category "${category}".`, [
            { field: 'category', message: `category must be one of: ${CATEGORIES.join(', ')}.` },
          ]);
        }
      }
      const search = typeof q === 'string' && q.trim() ? q.trim().slice(0, 100) : null;
      return repo.listEvents({ category: cat, q: search });
    },

    getEvent: requireEvent,

    createEvent(body) {
      const { value, errors } = validateEvent(body);
      if (errors.length) throw badRequest('Event data is invalid.', errors);
      return repo.getEvent(repo.insertEvent(value));
    },

    register(eventId, body) {
      const { value, errors } = validateRegistration(body);
      if (errors.length) throw badRequest('Registration data is invalid.', errors);

      // Check-then-insert runs in one transaction so two people can't both
      // take the last seat.
      return transaction(db, () => {
        const event = requireEvent(eventId);
        if (new Date(event.startTime) <= now()) {
          throw conflict('REGISTRATION_CLOSED', 'Registration has closed: this event has already started.');
        }
        if (repo.registrationExists(eventId, value.email)) {
          throw conflict('ALREADY_REGISTERED', 'This email is already registered for this event.');
        }
        if (repo.countRegistrations(eventId) >= event.capacity) {
          throw conflict('EVENT_FULL', 'This event is full. No seats are left.');
        }
        return repo.insertRegistration({ eventId, ...value });
      });
    },

    listRegistrations(eventId) {
      requireEvent(eventId);
      return repo.listRegistrations(eventId);
    },

    categories: () => CATEGORIES,
  };
}
