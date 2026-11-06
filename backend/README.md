# Milan API (Track C: Backend)

REST API for event discovery and participant registration for **Milan 2027**, the SRMIST cultural fest.

- **Stack:** Node.js 22+, Express 5, SQLite (Node's built-in `node:sqlite`, so there's no native module to compile), `helmet`, `cors`
- **Tests:** Node's built-in test runner plus `supertest`, 18 tests
- **Live base URL:** https://milan-api-uldz.onrender.com (try [/api/events](https://milan-api-uldz.onrender.com/api/events))

## Run locally

```bash
cd backend
npm install
cp .env.example .env      # then set ADMIN_API_KEY to a long random string
npm run dev               # http://localhost:4000, seeds 10 sample events on first run
npm test
```

## Project structure

```
src/
  server.js              entry point: opens DB, seeds, starts HTTP
  app.js                 builds the Express app: middleware, routes, error handler
  config.js              reads environment variables
  errors.js              ApiError and helpers for 400/401/404/409
  validation.js          input validation for events and registrations
  routes/events.js       HTTP layer: params in, status codes out
  services/eventService.js  business rules: capacity, duplicates, closed events
  middleware/adminAuth.js   X-Admin-Key check (constant-time compare)
  db/schema.sql          tables, constraints, indexes
  db/database.js         opens SQLite, runs schema, transaction helper
  db/repository.js       all SQL queries
  db/seed.js             sample data loader
test/api.test.js         endpoint tests on an in-memory DB
docs/milan-api.postman_collection.json
```

Requests flow **route → service → repository**. Routes know about HTTP, services know the rules, and the repository knows SQL. Each layer can be changed without touching the others.

## Data model

| events | | registrations | |
|---|---|---|---|
| `id` | INTEGER PK | `id` | INTEGER PK |
| `title` | TEXT NOT NULL | `event_id` | FK → events.id, ON DELETE CASCADE |
| `description` | TEXT NOT NULL | `name` | TEXT NOT NULL |
| `category` | TEXT, CHECK in list | `email` | TEXT NOT NULL, stored lower-case |
| `venue` | TEXT NOT NULL | `college` | TEXT NOT NULL |
| `start_time` | TEXT, ISO 8601 UTC | `phone` | TEXT, optional |
| `capacity` | INTEGER, CHECK > 0 | `created_at` | TEXT |
| `created_at` | TEXT | | **UNIQUE (event_id, email)** |

`registeredCount` and `seatsLeft` are computed from the registrations table rather than stored, so they can never drift out of sync.

## Endpoints

Base path: `/api`. All responses are JSON. Successful responses look like `{ "data": ... }`; lists also return `meta.count`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | none | Liveness check |
| GET | `/api/categories` | none | Allowed categories |
| GET | `/api/events` | none | List events, sorted by start time. Query: `category`, `q` (search) |
| GET | `/api/events/:id` | none | One event with `registeredCount` and `seatsLeft` |
| POST | `/api/events` | admin | Create an event → **201** with a `Location` header |
| POST | `/api/events/:id/registrations` | none | Register a participant → **201** |
| GET | `/api/events/:id/registrations` | admin | List registrations for an event |

Admin routes need the header `X-Admin-Key: <ADMIN_API_KEY>`.

### Errors

Every error uses the same shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Registration data is invalid.",
  "details": [{ "field": "email", "message": "email must be a valid email address." }] } }
```

| Status | `code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing or invalid fields (all reported at once), or an unknown category filter |
| 400 | `INVALID_JSON` | Body isn't valid JSON |
| 401 | `UNAUTHORIZED` | Admin key missing or wrong |
| 404 | `NOT_FOUND` | Unknown event ID or route |
| 409 | `ALREADY_REGISTERED` | Same email already registered for this event (case-insensitive) |
| 409 | `EVENT_FULL` | Capacity reached |
| 409 | `REGISTRATION_CLOSED` | Event has already started |
| 413 | `PAYLOAD_TOO_LARGE` | Body over 10 KB |

## Example requests

```bash
BASE=http://localhost:4000

curl "$BASE/api/events?category=Dance"
curl "$BASE/api/events/1"

curl -X POST "$BASE/api/events" \
  -H "Content-Type: application/json" -H "X-Admin-Key: $ADMIN_API_KEY" \
  -d '{"title":"Quiz Night","description":"General quiz, teams of two.","category":"Literary",
       "venue":"Mini Hall 1","startTime":"2027-03-19T18:00:00+05:30","capacity":40}'

curl -X POST "$BASE/api/events/1/registrations" \
  -H "Content-Type: application/json" \
  -d '{"name":"Sample Student","email":"sample@example.com","college":"Sample College"}'
```

Or import `docs/milan-api.postman_collection.json` into Postman, set `baseUrl` and `adminKey`, and run the whole collection. It covers the success cases plus the 400/401/404/409 cases.

## Design decisions

- **Capacity and duplicates are race-safe.** Registration runs inside a `BEGIN IMMEDIATE` transaction: check started → check duplicate → check capacity → insert. Two requests for the last seat can't both pass. The `UNIQUE(event_id, email)` constraint is a second line of defence.
- **Validation in two places.** The app returns friendly per-field errors, and the schema's `CHECK`, `NOT NULL` and `UNIQUE` constraints stop bad data even if a code path is wrong.
- **Times stored in UTC.** The API accepts any ISO offset (e.g. `+05:30`) and normalises to UTC; the frontend displays in IST.
- **Security basics.** Secrets only come from environment variables (`.env` is git-ignored). `helmet` adds security headers, request bodies are limited to 10 KB, SQL is always parameterised, the admin key is compared in constant time, and if `ADMIN_API_KEY` is unset, admin routes are disabled rather than open. Internal errors are logged server-side but never leaked to clients.
- **SQLite** keeps setup to zero (no database server). For production I'd move to Postgres. The repository layer is the only file that would change.

## Deploying (Render)

1. Push the repo to GitHub.
2. Render → **New → Blueprint** → select the repo. `render.yaml` sets everything up and generates `ADMIN_API_KEY`.
3. Set `CORS_ORIGIN` to the frontend's Vercel URL.

Note: Render's free tier has no persistent disk, so the SQLite file resets when the service restarts and the sample events are re-seeded. That's fine for a demo; a paid disk or a hosted Postgres fixes it.
