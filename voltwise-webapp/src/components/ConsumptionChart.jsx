import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

function formatTime(value) {
  const date = new Date(value);
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function ConsumptionChart({ history }) {
  if (!history || history.length === 0) {
    return <p className="muted">Henüz geçmiş tüketim verisi birikmedi.</p>;
  }

  const data = [...history]
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
    .map((point) => ({
      time: formatTime(point.recordedAt),
      energyKwh: Number((point.energyWh / 1000).toFixed(3)),
      cost: Number(point.cost.toFixed(2))
    }));

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Line type="monotone" dataKey="energyKwh" name="Enerji (kWh)" stroke="#38bdf8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="cost" name="Tutar (TL)" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
