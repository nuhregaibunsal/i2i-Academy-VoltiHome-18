import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { ConsumptionChart } from './ConsumptionChart.jsx';

const RANGES = [
  { key: 'live', label: 'Canlı', opts: () => ({ size: 40 }) },
  {
    key: 'today',
    label: 'Bugün',
    opts: () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to: new Date().toISOString(), size: 300 };
    }
  },
  { key: 'all', label: 'Tümü', opts: () => ({ size: 300 }) }
];

export function HistoryChart({ homeId }) {
  const [range, setRange] = useState('live');
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    const current = RANGES.find((r) => r.key === range) || RANGES[0];
    const fetchIt = () => {
      api
        .getHistory(homeId, current.opts())
        .then((d) => {
          if (active) setData(d);
        })
        .catch(() => {});
    };
    fetchIt();
    const handle = setInterval(fetchIt, 6000);
    return () => {
      active = false;
      clearInterval(handle);
    };
  }, [homeId, range]);

  return (
    <div className="history-chart">
      <div className="range-tabs">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`range-tab ${range === r.key ? 'active' : ''}`}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <ConsumptionChart history={data?.content} />
    </div>
  );
}
