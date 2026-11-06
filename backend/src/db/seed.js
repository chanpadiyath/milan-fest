import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { config } from '../config.js';
import { openDatabase, transaction } from './database.js';
import { createRepository } from './repository.js';
import { validateEvent } from '../validation.js';

const seedEvents = JSON.parse(readFileSync(new URL('./seed-events.json', import.meta.url), 'utf8'));

// Inserts the sample events, but only into an empty database.
export function seedIfEmpty(db) {
  const repo = createRepository(db);
  if (repo.countEvents() > 0) return 0;
  transaction(db, () => {
    for (const event of seedEvents) repo.insertEvent(validateEvent(event).value);
  });
  return seedEvents.length;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const added = seedIfEmpty(openDatabase(config.databasePath));
  console.log(added ? `Seeded ${added} events.` : 'Database already has events; nothing seeded.');
}
