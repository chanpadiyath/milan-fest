import { Link } from 'react-router-dom';
import CategoryTag from './CategoryTag.jsx';
import { CATEGORY_COLORS } from '../lib/constants.js';
import { formatDateTime, seatsLabel } from '../lib/format.js';

export default function EventCard({ event }) {
  const full = event.seatsLeft === 0;
  return (
    <article className="event-card" style={{ '--accent': CATEGORY_COLORS[event.category] }}>
      <div className="event-card-top">
        <CategoryTag category={event.category} />
        <span className={`seats ${full ? 'seats-full' : event.seatsLeft <= 5 ? 'seats-low' : ''}`}>
          {seatsLabel(event)}
        </span>
      </div>
      <h3 className="event-card-title">
        <Link to={`/events/${event.id}`} className="stretched-link">
          {event.title}
        </Link>
      </h3>
      <p className="event-card-desc">{event.description}</p>
      <dl className="event-meta">
        <div>
          <dt>When</dt>
          <dd>{formatDateTime(event.startTime)}</dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>{event.venue}</dd>
        </div>
      </dl>
    </article>
  );
}
