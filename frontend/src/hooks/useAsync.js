import { useCallback, useEffect, useState } from 'react';

// Runs an async loader and tracks loading / error / data, with a reload()
// for "Try again" buttons. Ignores results from stale requests.
export function useAsync(loader, deps) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    loader()
      .then((data) => active && setState({ loading: false, error: null, data }))
      .catch((error) => active && setState({ loading: false, error, data: null }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}
