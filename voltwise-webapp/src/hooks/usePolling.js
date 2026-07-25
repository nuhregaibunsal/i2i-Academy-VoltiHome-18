import { useEffect, useRef, useState } from 'react';

export function usePolling(fetcher, intervalMs, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    let active = true;

    async function tick() {
      try {
        const result = await fetcherRef.current();
        if (active) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    tick();
    const handle = setInterval(tick, intervalMs);
    return () => {
      active = false;
      clearInterval(handle);
    };
  }, [intervalMs, enabled]);

  return { data, loading, error };
}
