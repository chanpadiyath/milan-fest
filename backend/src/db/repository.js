// Data access only: SQL in, plain objects out. No business rules here.

const EVENT_COLUMNS = `
  e.id, e.title, e.description, e.category, e.venue,
  e.start_time AS startTime, e.capacity, e.created_at AS createdAt,
  (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS registeredCount`;

function toEvent(row) {
  if (!row) return null;
  return { ...row, seatsLeft: Math.max(row.capacity - row.registeredCount, 0) };
}

export function createRepository(db) {
  const stmts = {
    listEvents: db.prepare(`
      SELECT ${EVENT_COLUMNS} FROM events e
      WHERE ($category IS NULL OR e.category = $category)
        AND ($q IS NULL OR e.title LIKE $q OR e.description LIKE $q OR e.venue LIKE $q)
      ORDER BY e.start_time ASC, e.id ASC`),
    getEvent: db.prepare(`SELECT ${EVENT_COLUMNS} FROM events e WHERE e.id = ?`),
    insertEvent: db.prepare(`
      INSERT INTO events (title, description, category, venue, start_time, capacity)
      VALUES ($title, $description, $category, $venue, $startTime, $capacity)`),
    countEvents: db.prepare('SELECT COUNT(*) AS n FROM events'),
    countRegistrations: db.prepare('SELECT COUNT(*) AS n FROM registrations WHERE event_id = ?'),
    findRegistration: db.prepare('SELECT id FROM registrations WHERE event_id = ? AND email = ?'),
    insertRegistration: db.prepare(`
      INSERT INTO registrations (event_id, name, email, college, phone)
      VALUES ($eventId, $name, $email, $college, $phone)`),
    getRegistration: db.prepare(`
      SELECT id, event_id AS eventId, name, email, college, phone, created_at AS createdAt
      FROM registrations WHERE id = ?`),
    listRegistrations: db.prepare(`
      SELECT id, event_id AS eventId, name, email, college, phone, created_at AS createdAt
      FROM registrations WHERE event_id = ? ORDER BY id ASC`),
  };

  return {
    listEvents({ category = null, q = null } = {}) {
      const pattern = q ? `%${q.replace(/[%_\\]/g, '')}%` : null;
      return stmts.listEvents.all({ category, q: pattern }).map(toEvent);
    },
    getEvent: (id) => toEvent(stmts.getEvent.get(id)),
    insertEvent(event) {
      const { lastInsertRowid } = stmts.insertEvent.run(event);
      return Number(lastInsertRowid);
    },
    countEvents: () => stmts.countEvents.get().n,
    countRegistrations: (eventId) => stmts.countRegistrations.get(eventId).n,
    registrationExists: (eventId, email) => Boolean(stmts.findRegistration.get(eventId, email)),
    insertRegistration(registration) {
      const { lastInsertRowid } = stmts.insertRegistration.run(registration);
      return stmts.getRegistration.get(Number(lastInsertRowid));
    },
    listRegistrations: (eventId) => stmts.listRegistrations.all(eventId),
  };
}
