// Event times are stored in UTC and always shown in India time.
const TZ = 'Asia/Kolkata';

export const formatDate = (iso) =>
  new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ }).format(new Date(iso));

export const formatTime = (iso) =>
  new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ }).format(new Date(iso));

export const formatDateTime = (iso) => `${formatDate(iso)} · ${formatTime(iso)}`;

export function seatsLabel(event) {
  if (event.seatsLeft === 0) return 'Full';
  if (event.seatsLeft <= 5) return `Only ${event.seatsLeft} left`;
  return `${event.seatsLeft} seats left`;
}
