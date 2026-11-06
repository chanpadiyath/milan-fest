// Input validation. Each validator returns { value, errors }: `value` is the
// cleaned input (trimmed, normalised) and `errors` lists every problem found,
// so the client can show all field errors at once instead of one per request.

export const CATEGORIES = ['Dance', 'Music', 'Drama', 'Fashion', 'Technical', 'Literary', 'Art'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9]{10,13}$/;

function text(body, field, { min, max, required = true }, errors) {
  const raw = body?.[field];
  if (raw === undefined || raw === null || raw === '') {
    if (required) errors.push({ field, message: `${field} is required.` });
    return undefined;
  }
  if (typeof raw !== 'string') {
    errors.push({ field, message: `${field} must be a string.` });
    return undefined;
  }
  const value = raw.trim();
  if (value.length < min || value.length > max) {
    errors.push({ field, message: `${field} must be between ${min} and ${max} characters.` });
  }
  return value;
}

export function normaliseCategory(input) {
  if (typeof input !== 'string') return null;
  return CATEGORIES.find((c) => c.toLowerCase() === input.trim().toLowerCase()) ?? null;
}

export function validateEvent(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: [{ field: 'body', message: 'Request body must be a JSON object.' }] };
  }

  const title = text(body, 'title', { min: 3, max: 120 }, errors);
  const description = text(body, 'description', { min: 10, max: 2000 }, errors);
  const venue = text(body, 'venue', { min: 2, max: 120 }, errors);

  const category = normaliseCategory(body.category);
  if (!category) {
    errors.push({ field: 'category', message: `category must be one of: ${CATEGORIES.join(', ')}.` });
  }

  let startTime;
  const parsed = typeof body.startTime === 'string' ? new Date(body.startTime) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) {
    errors.push({ field: 'startTime', message: 'startTime must be an ISO 8601 date-time, e.g. 2027-03-18T18:00:00+05:30.' });
  } else {
    startTime = parsed.toISOString();
  }

  const capacity = body.capacity;
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) {
    errors.push({ field: 'capacity', message: 'capacity must be a whole number between 1 and 10000.' });
  }

  return { value: { title, description, category, venue, startTime, capacity }, errors };
}

export function validateRegistration(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: [{ field: 'body', message: 'Request body must be a JSON object.' }] };
  }

  const name = text(body, 'name', { min: 2, max: 80 }, errors);
  const college = text(body, 'college', { min: 2, max: 120 }, errors);

  let email = text(body, 'email', { min: 5, max: 254 }, errors);
  if (email !== undefined) {
    email = email.toLowerCase();
    if (!EMAIL_RE.test(email)) errors.push({ field: 'email', message: 'email must be a valid email address.' });
  }

  let phone = text(body, 'phone', { min: 1, max: 20, required: false }, errors);
  if (phone !== undefined) {
    phone = phone.replace(/[\s-]/g, '');
    if (!PHONE_RE.test(phone)) errors.push({ field: 'phone', message: 'phone must be 10 to 13 digits, optionally starting with +.' });
  }

  return { value: { name, email, college, phone: phone ?? null }, errors };
}

export function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
