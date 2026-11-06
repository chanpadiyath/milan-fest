// Pure filtering, so the Events page and the tests share one implementation.
// Search matches every word of the query against title, description, venue
// and category, so "dance hall" finds a dance event in Mini Hall 2.

export function filterEvents(events, { q = '', category = '' } = {}) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return events.filter((event) => {
    if (category && event.category !== category) return false;
    if (!words.length) return true;
    const haystack = `${event.title} ${event.description} ${event.venue} ${event.category}`.toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}

export function countByCategory(events) {
  return events.reduce((acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + 1 }), {});
}
