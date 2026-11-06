# Milan 2027: Event Discovery and Registration

DSA Tech Team Recruitment, Web Development track. A full-stack site for **Milan**, the national-level cultural fest at SRMIST Kattankulathur.

| Part | Folder | Stack | Live |
|---|---|---|---|
| Frontend (Track B) | [`frontend/`](frontend/README.md) | React 19, React Router, Vite | https://milan-fest-green.vercel.app |
| Backend (Track C) | [`backend/`](backend/README.md) | Node.js, Express 5, SQLite | https://milan-api-uldz.onrender.com |

```
Browser ──► React app (Vercel) ──fetch──► Milan API (Render) ──► SQLite
```

## Quick start

```bash
# Terminal 1: API on :4000
cd backend && npm install && cp .env.example .env && npm run dev

# Terminal 2: website on :5173
cd frontend && npm install && echo "VITE_API_URL=http://localhost:4000" > .env.local && npm run dev
```

Tests: `npm test` in each folder (18 backend, 10 frontend).

## What's included

- Browse 10 sample events, search by keyword, filter by category, view details, and register.
- The API validates input, blocks duplicate registrations and over-capacity bookings, and returns consistent JSON errors with proper status codes.
- Admin-only event creation, protected by an API key held in an environment variable.
- Postman collection: `backend/docs/milan-api.postman_collection.json`.

All event and participant data is fictional sample data. No secrets are committed; see each `.env.example`.
