import { config } from './config.js';
import { openDatabase } from './db/database.js';
import { seedIfEmpty } from './db/seed.js';
import { createApp } from './app.js';

const db = openDatabase(config.databasePath);
if (config.seedOnStart) {
  const added = seedIfEmpty(db);
  if (added) console.log(`Seeded ${added} sample events.`);
}

const app = createApp(db, { adminApiKey: config.adminApiKey, corsOrigins: config.corsOrigins });

app.listen(config.port, () => {
  console.log(`Milan API listening on http://localhost:${config.port}`);
  if (!config.adminApiKey) console.log('ADMIN_API_KEY is not set: POST /api/events is disabled.');
});
