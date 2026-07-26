import { useEffect, useRef, useState } from 'react';

export function useForecast(homes) {
  const prev = useRef(new Map());
  const [forecast, setForecast] = useState(new Map());

  useEffect(() => {
    if (!homes) return;
    const now = Date.now();
    const next = new Map();
    const fc = new Map();

    homes.forEach((h) => {
      const p = prev.current.get(h.homeId);
      let rate = p ? p.rate : 0;
      if (p && now > p.t) {
        const inst = (h.accumulatedCost - p.cost) / ((now - p.t) / 1000);
        rate = p.rate ? p.rate * 0.6 + inst * 0.4 : inst;
      }
      next.set(h.homeId, { cost: h.accumulatedCost, t: now, rate });

      if (!h.quotaBreached && rate > 0.00002) {
        const remaining = h.budgetLimit - h.accumulatedCost;
        if (remaining > 0) {
          const seconds = remaining / rate;
          if (seconds < 3600) {
            fc.set(h.homeId, seconds);
          }
        }
      }
    });

    prev.current = next;
    setForecast(fc);
  }, [homes]);

  return forecast;
}
