// Client-side validation. It mirrors the API's rules so users get instant
// feedback; the API still validates everything itself.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9]{10,13}$/;

export function validateRegistration(values) {
  const errors = {};
  const name = values.name?.trim() ?? '';
  const email = values.email?.trim() ?? '';
  const college = values.college?.trim() ?? '';
  const phone = (values.phone ?? '').replace(/[\s-]/g, '');

  if (!name) errors.name = 'Enter your full name.';
  else if (name.length < 2 || name.length > 80) errors.name = 'Name must be 2 to 80 characters.';

  if (!email) errors.email = 'Enter your email address.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email, like name@example.com.';

  if (!college) errors.college = 'Enter your college or institution.';
  else if (college.length < 2 || college.length > 120) errors.college = 'College must be 2 to 120 characters.';

  if (phone && !PHONE_RE.test(phone)) errors.phone = 'Phone must be 10 to 13 digits, optionally starting with +.';

  if (!values.agree) errors.agree = 'Please confirm you have read the event rules.';

  return errors;
}
