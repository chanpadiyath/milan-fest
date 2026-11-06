import { describe, expect, test } from 'vitest';
import { countByCategory, filterEvents } from './filterEvents.js';
import events from '../data/events.json';

describe('filterEvents', () => {
  test('returns everything with no filters', () => {
    expect(filterEvents(events)).toHaveLength(events.length);
  });

  test('filters by category', () => {
    const result = filterEvents(events, { category: 'Music' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((e) => e.category === 'Music')).toBe(true);
  });

  test('search is case-insensitive and matches venue', () => {
    expect(filterEvents(events, { q: 'ROBO' }).map((e) => e.title)).toEqual(['RoboRace']);
    expect(filterEvents(events, { q: 'open air' }).map((e) => e.title)).toEqual(['Battle of Bands']);
  });

  test('every search word must match', () => {
    expect(filterEvents(events, { q: 'solo hall' }).map((e) => e.title)).toEqual(['Solo Steps']);
  });

  test('combines search with category', () => {
    expect(filterEvents(events, { q: 'auditorium', category: 'Fashion' })).toHaveLength(1);
    expect(filterEvents(events, { q: 'robo', category: 'Dance' })).toHaveLength(0);
  });
});

test('countByCategory', () => {
  const counts = countByCategory(events);
  expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(events.length);
});
