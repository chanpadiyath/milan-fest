import { Link, useParams } from 'react-router-dom';
import { getEvent } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { CATEGORY_COLORS } from '../lib/constants.js';
import { formatDate, formatTime, seatsLabel } from '../lib/format.js';
import CategoryTag from '../components/CategoryTag.jsx';
import { ErrorState, Loading } from '../components/StateMessage.jsx';
import NotFoundPage from './NotFoundPage.jsx';

export default function EventDetailPage() {
  const { id } = useParams();
  const { data: event, loading, error, reload } = useAsync(() => getEvent(id), [id]);

  if (loading) return <div className="container page"><Loading label="Loading event…" /></div>;
  if (error?.status === 404) return <NotFoundPage message="That event doesn't exist or has been removed." />;
  if (error) return <div className="container page"><ErrorState error={error} onRetry={reload} /></div>;

  const full = event.seatsLeft === 0;
  const started = new Date(event.startTime) <= new Date();
  const filledPct = Math.round((event.registeredCount / event.capacity) * 100);

  return (
    <div className="container page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/events">Events</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/events?category=${event.category}`}>{event.category}</Link>
      </nav>

      <article className="detail" style={{ '--accent': CATEGORY_COLORS[event.category] }}>
        <div className="detail-main">
          <CategoryTag category={event.category} />
          <h1 className="detail-title">{event.title}</h1>
          <p className="detail-desc">{event.description}</p>
        </div>

        <aside className="detail-card" aria-label="Event details and registration">
          <dl className="detail-facts">
            <div>
              <dt>Date</dt>
              <dd>{formatDate(event.startTime)}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{formatTime(event.startTime)} IST</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>{event.venue}</dd>
            </div>
            <div>
              <dt>Seats</dt>
              <dd>
                {seatsLabel(event)} <span className="muted">of {event.capacity}</span>
              </dd>
            </div>
          </dl>
          <div
            className="capacity-bar"
            role="progressbar"
            aria-label="Seats filled"
            aria-valuenow={filledPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${filledPct}%` }} />
          </div>

          {started ? (
            <p className="notice">Registration has closed for this event.</p>
          ) : full ? (
            <p className="notice">This event is full.</p>
          ) : (
            <Link to={`/events/${event.id}/register`} className="btn btn-primary btn-block">
              Register for this event
            </Link>
          )}
          <Link to="/events" className="btn btn-ghost btn-block">
            Back to all events
          </Link>
        </aside>
      </article>
    </div>
  );
}
