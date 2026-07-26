export function ApplianceList({ appliances, onRemove }) {
  return (
    <div className="appliance-list">
      {appliances.map((appliance) => (
        <div
          key={appliance.applianceId}
          className={`appliance-row ${appliance.anomalous ? 'appliance-anomalous' : ''}`}
        >
          <div className="appliance-name">
            <span>{appliance.name}</span>
            {appliance.anomalous && <span className="badge badge-anomaly">Anomali</span>}
          </div>
          <div className="appliance-metrics">
            <span className="watt">{appliance.lastWatt.toFixed(1)} W</span>
            <span className="muted">limit {appliance.safeLimitWatt.toFixed(0)} W</span>
            {appliance.consecutiveBreaches > 0 && (
              <span className="breach-count">{appliance.consecutiveBreaches} ardışık aşım</span>
            )}
            {onRemove && (
              <button
                type="button"
                className="appliance-remove"
                aria-label={`${appliance.name} cihazını kaldır`}
                title="Kaldır"
                onClick={() => onRemove(appliance.applianceId, appliance.name)}
              >
                ×
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
