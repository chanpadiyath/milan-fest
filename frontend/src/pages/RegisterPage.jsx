import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEvent, registerForEvent } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { validateRegistration } from '../lib/validateRegistration.js';
import { formatDateTime } from '../lib/format.js';
import FormField from '../components/FormField.jsx';
import CategoryTag from '../components/CategoryTag.jsx';
import { ErrorState, Loading } from '../components/StateMessage.jsx';
import NotFoundPage from './NotFoundPage.jsx';

const EMPTY = { name: '', email: '', college: '', phone: '', agree: false };
const FIELD_ORDER = ['name', 'email', 'college', 'phone', 'agree'];

export default function RegisterPage() {
  const { id } = useParams();
  const { data: event, loading, error, reload } = useAsync(() => getEvent(id), [id]);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [submitError, setSubmitError] = useState(null);
  const [registration, setRegistration] = useState(null);
  const formRef = useRef(null);

  if (loading) return <div className="container page"><Loading label="Loading registration…" /></div>;
  if (error?.status === 404) return <NotFoundPage message="That event doesn't exist, so there's nothing to register for." />;
  if (error) return <div className="container page"><ErrorState error={error} onRetry={reload} /></div>;

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    const next = { ...values, [name]: type === 'checkbox' ? checked : value };
    setValues(next);
    // Once a field has been visited, re-check it as the user types.
    if (touched[name]) setErrors(validateRegistration(next));
  }

  function onBlur(e) {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validateRegistration(values));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const found = validateRegistration(values);
    setErrors(found);
    setTouched(Object.fromEntries(FIELD_ORDER.map((f) => [f, true])));
    if (Object.keys(found).length) {
      const first = FIELD_ORDER.find((f) => found[f]);
      formRef.current?.elements[first]?.focus();
      return;
    }

    setStatus('submitting');
    setSubmitError(null);
    try {
      const { agree: _agree, phone, ...rest } = values;
      const payload = { ...rest, ...(phone.trim() && { phone: phone.trim() }) };
      setRegistration(await registerForEvent(event.id, payload));
      setStatus('success');
      window.scrollTo(0, 0);
    } catch (err) {
      // Map server-side field errors back onto the form when present.
      if (err.details?.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      }
      setSubmitError(err);
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="container page narrow">
        <section className="success" role="status" aria-live="polite">
          <div className="success-icon" aria-hidden="true">✓</div>
          <h1>You're registered!</h1>
          <p>
            <strong>{registration.name}</strong>, your seat for <strong>{event.title}</strong> is confirmed.
          </p>
          <dl className="summary">
            <div><dt>When</dt><dd>{formatDateTime(event.startTime)} IST</dd></div>
            <div><dt>Where</dt><dd>{event.venue}</dd></div>
            <div><dt>Email</dt><dd>{registration.email}</dd></div>
            <div><dt>Registration ID</dt><dd>MIL-{String(registration.id).slice(-6).padStart(4, '0')}</dd></div>
          </dl>
          <p className="muted small">Please arrive 20 minutes early with your college ID.</p>
          <div className="success-actions">
            <Link to="/events" className="btn btn-primary">Explore more events</Link>
            <Link to={`/events/${event.id}`} className="btn btn-ghost">Back to event</Link>
          </div>
        </section>
      </div>
    );
  }

  const closed = event.seatsLeft === 0 || new Date(event.startTime) <= new Date();
  const show = (f) => (touched[f] ? errors[f] : undefined);
  const errorCount = Object.keys(errors).filter((f) => touched[f]).length;

  return (
    <div className="container page narrow">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/events">Events</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/events/${event.id}`}>{event.title}</Link>
      </nav>

      <header className="page-head">
        <h1>Register</h1>
        <div className="register-event">
          <CategoryTag category={event.category} />
          <p>
            <strong>{event.title}</strong>
            <br />
            <span className="muted">{formatDateTime(event.startTime)} IST · {event.venue}</span>
          </p>
        </div>
      </header>

      {closed ? (
        <div className="notice">
          Registration isn't available: {event.seatsLeft === 0 ? 'this event is full.' : 'this event has already started.'}{' '}
          <Link to="/events">Browse other events</Link>
        </div>
      ) : (
        <form ref={formRef} className="form" noValidate onSubmit={onSubmit}>
          {status === 'error' && submitError && (
            <div className="alert alert-error" role="alert">
              <strong>Registration failed.</strong> {submitError.message}
            </div>
          )}
          {status !== 'error' && errorCount > 0 && (
            <div className="alert alert-error" role="alert">
              Please fix {errorCount} field{errorCount === 1 ? '' : 's'} below.
            </div>
          )}

          <FormField id="name" label="Full name" required autoComplete="name" value={values.name} onChange={onChange} onBlur={onBlur} error={show('name')} />
          <FormField
            id="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            hint="We'll send your confirmation here."
            value={values.email}
            onChange={onChange}
            onBlur={onBlur}
            error={show('email')}
          />
          <FormField id="college" label="College / institution" required autoComplete="organization" value={values.college} onChange={onChange} onBlur={onBlur} error={show('college')} />
          <FormField id="phone" label="Phone" type="tel" autoComplete="tel" inputMode="tel" hint="10 digits, e.g. 9876543210" value={values.phone} onChange={onChange} onBlur={onBlur} error={show('phone')} />

          <div className={`field field-check ${show('agree') ? 'field-invalid' : ''}`}>
            <input
              id="agree"
              name="agree"
              type="checkbox"
              checked={values.agree}
              onChange={onChange}
              onBlur={onBlur}
              aria-invalid={Boolean(show('agree'))}
              aria-describedby={show('agree') ? 'agree-error' : undefined}
            />
            <label htmlFor="agree">I have read the event rules and agree to follow the fest code of conduct.</label>
            {show('agree') && <p id="agree-error" className="field-error">{show('agree')}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Registering…' : 'Confirm registration'}
          </button>
          <p className="muted small center">{event.seatsLeft} seat{event.seatsLeft === 1 ? '' : 's'} left · Free entry</p>
        </form>
      )}
    </div>
  );
}
