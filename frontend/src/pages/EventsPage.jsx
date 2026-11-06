import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listEvents } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { CATEGORIES, CATEGORY_COLORS } from '../lib/constants.js';
import { countByCategory, filterEvents } from '../lib/filterEvents.js';
import EventCard from '../components/EventCard.jsx';
import { EmptyState, ErrorState, EventGridSkeleton } from '../components/StateMessage.jsx';

export default function EventsPage() {
  const { data: events, loading, error, reload } = useAsync(listEvents, []);

  // Search and category live in the URL so filtered views can be shared
  // and the back button works.
  const [params, setParams] = useSearchParams();
  const category = CATEGORIES.includes(params.get('category')) ? params.get('category') : '';
  const q = params.get('q') ?? '';
  const [query, setQuery] = useState(q);

  useEffect(() => setQuery(q), [q]);

  function update(next) {
    const merged = { q, category, ...next };
    const clean = Object.fromEntries(Object.entries(merged).filter(([, v]) => v));
    setParams(clean, { replace: true });
  }

  // Debounce typing so the URL isn't rewritten on every keystroke.
  useEffect(() => {
    if (query === q) return;
    const t = setTimeout(() => update({ q: query.trim() }), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const counts = events ? countByCategory(events) : {};
  const results = events ? filterEvents(events, { q, category }) : [];
  const filtersActive = Boolean(q || category);

  return (
    <div className="container page">
      <header className="page-head">
        <h1>Events</h1>
        <p className="muted">Search by name, venue or keyword, or narrow down by category.</p>
      </header>

      <div className="filters" role="search">
        <label htmlFor="search" className="sr-only">
          Search events
        </label>
        <div className="search-box">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="search"
            type="search"
            placeholder="Search events, e.g. robot, solo, auditorium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="clear-btn" onClick={() => setQuery('')} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <div className="chips" role="group" aria-label="Filter by category">
          <button className="chip" aria-pressed={!category} onClick={() => update({ category: '' })}>
            All {events && <span className="chip-count">{events.length}</span>}
          </button>
          {CATEGORIES.filter((c) => !events || counts[c]).map((c) => (
            <button
              key={c}
              className="chip"
              style={{ '--accent': CATEGORY_COLORS[c] }}
              aria-pressed={category === c}
              onClick={() => update({ category: category === c ? '' : c })}
            >
              {c} {events && <span className="chip-count">{counts[c]}</span>}
            </button>
          ))}
        </div>
      </div>

      <p className="results-count" role="status" aria-live="polite">
        {events && `${results.length} event${results.length === 1 ? '' : 's'}${filtersActive ? ` match${results.length === 1 ? 'es' : ''} your filters` : ''}`}
      </p>

      {loading && <EventGridSkeleton />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && results.length === 0 && (
        <EmptyState
          title="No events match"
          action={
            <button
              className="btn btn-outline"
              onClick={() => {
                setQuery('');
                setParams({}, { replace: true });
              }}
            >
              Clear filters
            </button>
          }
        >
          {q ? `Nothing found for “${q}”${category ? ` in ${category}` : ''}.` : `No ${category} events yet.`} Try a different
          word or category.
        </EmptyState>
      )}
      {!loading && !error && results.length > 0 && (
        <div className="event-grid">
          {results.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
