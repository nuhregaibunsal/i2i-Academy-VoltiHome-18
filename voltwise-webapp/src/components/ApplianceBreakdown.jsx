export function ApplianceBreakdown({ appliances }) {
  const total = appliances.reduce((sum, a) => sum + a.cumulativeWh, 0);
  if (total <= 0) {
    return <p className="muted">Dağılım için henüz yeterli veri yok.</p>;
  }

  const sorted = [...appliances].sort((a, b) => b.cumulativeWh - a.cumulativeWh);

  return (
    <div className="breakdown">
      {sorted.map((a) => {
        const share = (a.cumulativeWh / total) * 100;
        return (
          <div key={a.applianceId} className="breakdown-row">
            <div className="breakdown-label">
              <span>{a.name}</span>
              <span className="readout breakdown-pct">%{share.toFixed(0)}</span>
            </div>
            <div className="breakdown-track">
              <div
                className={`breakdown-fill ${a.anomalous ? 'fill-warn' : 'fill-safe'}`}
                style={{ width: `${Math.max(share, 1.5)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
