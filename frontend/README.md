# Milan Website (Track B: Frontend)

Responsive website for **Milan 2027**, where visitors discover events, search and filter them, view details, and register.

- **Stack:** React 19, React Router 7, Vite 6, plain CSS with design tokens, Vitest
- **Live site:** https://milan-fest-green.vercel.app

## Run locally

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm test           # 10 unit tests
npm run build      # production build in dist/
```

**Data source.** If `VITE_API_URL` is set (see `.env.example`), the site uses the Milan API. If it isn't, it runs on the bundled sample data in `src/data/events.json`, with registrations saved in the browser's localStorage. This means the site always works, even without a backend.

## Features

| Requirement | Where |
|---|---|
| Homepage with nav, hero, intro, featured events | `pages/HomePage.jsx` |
| Events page, 10 sample events | `pages/EventsPage.jsx` |
| Keyword search (title, description, venue, category; multi-word) | `lib/filterEvents.js` |
| Category filters with counts | `pages/EventsPage.jsx` |
| Event details page with date, time (IST), venue, seats and capacity bar | `pages/EventDetailPage.jsx` |
| Registration form with client-side validation and success/error states | `pages/RegisterPage.jsx`, `lib/validateRegistration.js` |
| Responsive layout with mobile menu | `index.css`, `components/Header.jsx` |
| Loading skeletons, empty results, network errors with retry, 404 page, full/closed events | `components/StateMessage.jsx`, `pages/NotFoundPage.jsx` |

## Structure

```
src/
  api/client.js          one data layer: Milan API or local JSON fallback
  data/events.json       sample events
  hooks/useAsync.js      loading / error / data + reload()
  lib/                   pure logic (filtering, validation, formatting): unit-tested
  components/            Header, Footer, EventCard, CategoryTag, FormField, StateMessage
  pages/                 one file per route
  index.css              design tokens and styles
```

Data (`data/`, `api/`) is separated from presentation (`components/`, `pages/`). Pages never call `fetch` directly; they use `api/client.js`, so switching between the API and local data is a single environment variable.

## Design and UX decisions

- **Filters live in the URL** (`/events?category=Dance&q=solo`), so filtered views are shareable, survive refresh and work with the back button. Search input is debounced by 200 ms.
- **Validation** runs when a field loses focus, then live as you type once a field has been visited. Submitting with errors focuses the first invalid field. Server errors (duplicate, full, closed) show in an alert, and any server field errors map back onto the form.
- **Accessibility:** skip link, semantic landmarks, labelled inputs with `aria-invalid` and `aria-describedby`, `aria-pressed` on filter chips, live regions for result counts and success, visible focus rings, `prefers-reduced-motion` respected, 48 px touch targets.
- **Visual identity:** deep plum and marigold for a festive night-time look, Bricolage Grotesque for display text and Inter for body text. The hero pattern is pure CSS gradients inspired by rangoli rings, so there are no image assets or licensing concerns.

## Deploying (Vercel)

1. Push the repo to GitHub.
2. Vercel → **Add New Project** → import the repo → set **Root Directory** to `frontend`. Vite is auto-detected.
3. Add the environment variable `VITE_API_URL` = your Render API URL (no trailing slash).
4. Deploy. `vercel.json` rewrites all paths to `index.html` so deep links like `/events/3` work. For Netlify, `public/_redirects` does the same.
