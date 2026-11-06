// Labelled input with hint and error text wired up for screen readers.
export default function FormField({ id, label, error, hint, required, ...inputProps }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${error ? 'field-invalid' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true" className="req"> *</span> : <span className="optional"> (optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      <input id={id} name={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} required={required} {...inputProps} />
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
