import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

export function FleetTrend({ data }) {
  if (!data || data.length < 2) {
    return null;
  }

  return (
    <div className="fleet-trend card">
      <div className="fleet-trend-head">
        <span className="unit-label">filo toplam tüketim (canlı)</span>
        <span className="readout fleet-trend-now">
          {data[data.length - 1].total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
        </span>
      </div>
      <ResponsiveContainer width="100%" height={64}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="fleetFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--steel)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--steel)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[0, 'dataMax']} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
            labelFormatter={() => ''}
            formatter={(value) => [`${value.toFixed(2)} ₺`, 'toplam']}
          />
          <Area type="monotone" dataKey="total" stroke="var(--steel)" strokeWidth={2} fill="url(#fleetFill)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
