import { describe, expect, test } from 'vitest';
import { validateRegistration } from './validateRegistration.js';

const valid = { name: 'Asha Rao', email: 'asha@example.com', college: 'Sample College', phone: '', agree: true };

describe('validateRegistration', () => {
  test('accepts a valid form, phone optional', () => {
    expect(validateRegistration(valid)).toEqual({});
    expect(validateRegistration({ ...valid, phone: '98765 43210' })).toEqual({});
  });

  test('flags every required field when empty', () => {
    expect(Object.keys(validateRegistration({})).sort()).toEqual(['agree', 'college', 'email', 'name']);
  });

  test('rejects bad email and phone', () => {
    const errors = validateRegistration({ ...valid, email: 'asha@', phone: '123' });
    expect(errors.email).toMatch(/valid email/);
    expect(errors.phone).toMatch(/10 to 13 digits/);
  });

  test('treats whitespace-only as empty', () => {
    expect(validateRegistration({ ...valid, name: '   ' }).name).toBe('Enter your full name.');
  });
});
