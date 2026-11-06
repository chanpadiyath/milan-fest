// All runtime configuration comes from environment variables (see .env.example).
// Nothing secret has a default: if ADMIN_API_KEY is unset, admin routes are disabled.

export const config = {
  port: Number(process.env.PORT) || 4000,
  databasePath: process.env.DATABASE_PATH || './data/milan.db',
  adminApiKey: process.env.ADMIN_API_KEY || '',
  corsOrigins: (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  seedOnStart: process.env.SEED_ON_START !== 'false',
};
