// One component for loading, empty and error states, so they look consistent.

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="state">
      <p className="state-title">{title}</p>
      {children && <p className="muted">{children}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <p className="state-title">Something went wrong</p>
      <p className="muted">{error?.message ?? 'Please try again.'}</p>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }) {
  return (
    <div className="event-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="event-card skeleton" />
      ))}
    </div>
  );
}
