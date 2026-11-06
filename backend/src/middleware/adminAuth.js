import { timingSafeEqual } from 'node:crypto';
import { ApiError, unauthorized } from '../errors.js';

// Admin routes need the header `X-Admin-Key: <ADMIN_API_KEY>`.
// The comparison is constant-time so the key can't be guessed by timing.
export function adminAuth(adminApiKey) {
  const expected = Buffer.from(adminApiKey);

  return (req, _res, next) => {
    if (!adminApiKey) {
      return next(new ApiError(503, 'ADMIN_DISABLED', 'Admin routes are disabled: ADMIN_API_KEY is not set on the server.'));
    }
    const given = Buffer.from(req.get('x-admin-key') ?? '');
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
      return next(unauthorized());
    }
    next();
  };
}
