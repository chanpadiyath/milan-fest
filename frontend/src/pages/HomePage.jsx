import { Link } from 'react-router-dom';
import { listEvents } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { CATEGORIES, CATEGORY_COLORS, FEST } from '../lib/constants.js';
import { countByCategory } from '../lib/filterEvents.js';
import EventCard from '../components/EventCard.jsx';
import { ErrorState, EventGridSkeleton } from '../components/StateMessage.jsx';

const FEATURED_COUNT = 3;

export default function HomePage() {
  const { data: events, loading, error, reload } = useAsync(listEvents, []);
  const counts = events ? countByCategory(events) : {};
  // Featured: the events with the fewest seats left, i.e. the ones to grab first.
  const featured = events
    ? [...events].filter((e) => e.seatsLeft > 0).sort((a, b) => a.seatsLeft - b.seatsLeft).slice(0, FEATURED_COUNT)
    : [];

  return (
    <>
      <section className="hero">
        <div className="hero-pattern" aria-hidden="true" />
        <div className="container hero-inner">
          <p className="eyebrow">National-level cultural fest · SRMIST</p>
          <h1 className="hero-title">
            Milan<span className="hero-year">{FEST.year}</span>
          </h1>
          <p className="hero-lead">
            Three days where campuses from across India meet on one stage. Dance, music, drama, fashion and tech,
            all under the open sky at Kattankulathur.
          </p>
          <p className="hero-date">
            <strong>{FEST.dates}</strong> · {FEST.place}
          </p>
          <div className="hero-actions">
            <Link to="/events" className="btn btn-primary">
              Explore events
            </Link>
            <a href="#about" className="btn btn-ghost">
              About Milan
            </a>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="categories-heading">
        <div className="container">
          <div className="section-head">
            <h2 id="categories-heading">Find your stage</h2>
            <Link to="/events" className="link-arrow">
              All events
            </Link>
          </div>
          <ul className="category-grid">
            {CATEGORIES.filter((c) => !events || counts[c]).map((c) => (
              <li key={c}>
                <Link to={`/events?category=${c}`} className="category-tile" style={{ '--accent': CATEGORY_COLORS[c] }}>
                  <span className="category-name">{c}</span>
                  <span className="category-count">{events ? `${counts[c]} event${counts[c] === 1 ? '' : 's'}` : ' '}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="featured-heading">
        <div className="container">
          <div className="section-head">
            <h2 id="featured-heading">Filling up fast</h2>
            <Link to="/events" className="link-arrow">
              See all
            </Link>
          </div>
          {loading && <EventGridSkeleton count={FEATURED_COUNT} />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {!loading && !error && (
            <div className="event-grid">
              {featured.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="about" className="section" aria-labelledby="about-heading">
        <div className="container about">
          <div>
            <h2 id="about-heading">About Milan</h2>
            <p>
              Milan, Hindi for <em>meeting</em>, is the national-level cultural fest of SRM Institute of Science and
              Technology, run by the Directorate of Student Affairs. Every year it brings thousands of students from
              colleges across the country to compete, perform and collaborate.
            </p>
            <p>
              Registration is free for all events. Pick an event, check the date and venue, and save your seat in
              under a minute.
            </p>
          </div>
          <dl className="stats">
            <div>
              <dt>Days</dt>
              <dd>3</dd>
            </div>
            <div>
              <dt>Events</dt>
              <dd>{events ? events.length : '–'}</dd>
            </div>
            <div>
              <dt>Categories</dt>
              <dd>{events ? Object.keys(counts).length : '–'}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
